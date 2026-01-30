import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils/topoSort";
import { ExecutionStatus, NodeType } from "@/generated/prisma/enums";
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
    {
        id: "execute-workflow",
        retries: process.env.NODE_ENV === 'production' ? 3 : 0,
        onFailure: async ({ event, step }) => {
            return prisma.execution.update({
                where: { inngestEventId: event.data.event.id },
                data: {
                    status: ExecutionStatus.FAILED,
                    error: event.data.error.message,
                    errorStack: event.data.error.stack,
                },
            });
        }
    },
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
        const inngestEventId = event.id;

        if (!inngestEventId || !workflowId) {
            throw new NonRetriableError('Inngest ID or Workflow ID is missing');
        };

        await step.run('create-execution', async () => {
            return prisma.execution.create({
                data: {
                    workflowId,
                    inngestEventId,
                },
            });
        });


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

        await step.run('update-execution', async () => {
            return prisma.execution.update({
                where: {
                    inngestEventId,
                    workflowId
                },
                data: {
                    status: ExecutionStatus.SUCCESS,
                    completedAt: new Date(),
                    output: context,
                },
            })
        })

        return {
            workflowId,
            result: context
        }
    }
);