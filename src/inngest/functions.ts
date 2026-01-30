import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils/topoSort";
import { NodeType } from "@/generated/prisma/enums";
import { getExecutor } from "@/features/executions/components/lib/executorRegistory";
import { httpRequestChannel } from "./channels/httpRequest";
import { manualTriggerChannel } from "./channels/manualTrigger";
import { googleFormTriggerChannel } from "./channels/googleFormTrigger";
import { polarTriggerChannel } from "./channels/polarTrigger";
import { stripeTriggerChannel } from "./channels/stripeTrigger";
import { geminiChannel } from "./channels/gemini";
import { openRouterChannel } from "./channels/openrouter";
import { openAIChannel } from "./channels/openAi";
import { anthropicChannel } from "./channels/anthropic";
import { grokChannel } from "./channels/grok";
import { deepseekChannel } from "./channels/deepseek";


export const executeWorkflow = inngest.createFunction(
    { id: "execute-workflow", retries: 0 },
    {
        event: "workflows/execute.workflow",
        channels: [
            httpRequestChannel(),
            manualTriggerChannel(),
            googleFormTriggerChannel(),
            stripeTriggerChannel(),
            polarTriggerChannel(),
            geminiChannel(),
            openRouterChannel(),
            openAIChannel(),
            deepseekChannel(),
            anthropicChannel(),
            grokChannel(),
        ]
    },
    async ({ event, step, publish }) => {
        const workflowId = event.data.workflowId;

        if (!workflowId) {
            throw new NonRetriableError("Workflow Id is missing")
        };

        const sortedNodes = await step.run("prepare-workflow", async () => {
            const workflow = await prisma.workflow.findUniqueOrThrow({
                where: { id: workflowId },
                include: {
                    nodes: true,
                    connections: true
                },
            });

            return topologicalSort(workflow.nodes, workflow.connections);
        });

        const userId = await step.run("get-userId", async () => {
            const workflow = await prisma.workflow.findUniqueOrThrow({
                where: { id: workflowId },
                select: {
                    userId: true
                }
            });
            return workflow.userId
        })

        // intialise context with intial data 
        let context = event.data.initialData || {};

        for (const node of sortedNodes) {
            const executor = getExecutor(node.type as NodeType)
            context = await executor({
                data: node.data as Record<string, unknown>,
                nodeId: node.id,
                context,
                userId,
                step,
                publish
            })
        }

        return {
            workflowId,
            result: context
        }
    }
);