import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils/topoSort";
import { NodeType } from "@/generated/prisma/enums";
import { getExecutor } from "@/features/executions/components/lib/executorRegistory";
import { httpRequestChannel } from "./channels/httpRequest";
import { manualTriggerChannel } from "./channels/manualTrigger";


export const executeWorkflow = inngest.createFunction(
    { id: "execute-workflow", retries: 0 },
    {
        event: "workflows/execute.workflow",
        channels: [
            httpRequestChannel(),
            manualTriggerChannel()
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


        // intialise context with intial data 
        let context = event.data.initalData || {};

        for (const node of sortedNodes) {
            const executor = getExecutor(node.type as NodeType)
            context = await executor({
                data: node.data as Record<string, unknown>,
                nodeId: node.id,
                context,
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