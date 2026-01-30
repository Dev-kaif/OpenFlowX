import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils/topoSort";
import { getReachableNodeIds } from "./utils/reachability";
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
import { buildNodeInput, buildParentsMap } from "./utils/parents";
import { discordChannel } from "./channels/discord";
import { slackChannel } from "./channels/slack";


const TRIGGER_NODE_TYPES: NodeType[] = [
    NodeType.INITIAL,
    NodeType.MANUAL_TRIGGER,
    NodeType.GOOGLE_FORM_TRIGGER,
    NodeType.STRIPE_TRIGGER,
    NodeType.POLAR_TRIGGER,
];


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

        // Realtime channels for node status updates
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
            discordChannel(),
            slackChannel()
        ]
    },
    async ({ event, step, publish }) => {

        const workflowId = event.data.workflowId;
        const inngestEventId = event.id;

        if (!inngestEventId || !workflowId) {
            throw new NonRetriableError('Inngest ID or Workflow ID is missing');
        };

        // Create Execution Job
        await step.run('create-execution', async () => {
            return prisma.execution.create({
                data: {
                    workflowId,
                    inngestEventId,
                },
            });
        });


        // get workflow data
        const workflow = await step.run("load-workflow", async () => {
            return prisma.workflow.findUniqueOrThrow({
                where: { id: workflowId },
                include: {
                    nodes: true,
                    connections: true,
                },
            });
        });


        // Find Trigger nodes from workflow
        const triggerNodeIds = workflow.nodes
            .filter((n) => TRIGGER_NODE_TYPES.includes(n.type as NodeType))
            .map((n) => n.id);

        if (triggerNodeIds.length === 0) {
            throw new NonRetriableError("Workflow has no trigger node");
        }

        // Filter outs all the non connected nodes
        // Only connected nodes should be executed
        const reachableNodeIds = getReachableNodeIds(triggerNodeIds, workflow.connections);

        const executableNodes = workflow.nodes.filter((n) =>
            reachableNodeIds.has(n.id)
        );

        const executableConnections = workflow.connections.filter(
            (c) =>
                reachableNodeIds.has(c.fromNodeId) &&
                reachableNodeIds.has(c.toNodeId)
        );


        // Sort node in topological order
        const sortedNodes = topologicalSort(
            executableNodes,
            executableConnections
        );

        // create parent child relationships of nodes based on connections
        const parentsMap = buildParentsMap(executableConnections);

        // Execute nodes in order
        const nodeOutputs: Record<string, any> = {};
        const userId = workflow.userId;

        for (const node of sortedNodes) {

            const executor = getExecutor(node.type as NodeType);

            if (!executor) {
                throw new NonRetriableError(
                    `No executor registered for node type ${node.type}`
                );
            }

            // Trigger nodes receive initial event data.
            // All other nodes receive outputs from their parent nodes only
            const context =
                triggerNodeIds.includes(node.id)
                    ? event.data.initialData || {}
                    : buildNodeInput(node.id, parentsMap, nodeOutputs);


            const output = await executor({
                nodeId: node.id,
                data: node.data as Record<string, unknown>,
                context,
                userId,
                step,
                publish,
            });

            nodeOutputs[node.id] = output;
        }

        // Update execution
        await step.run("update-execution", async () => {
            return prisma.execution.update({
                where: {
                    workflowId,
                    inngestEventId,
                },
                data: {
                    status: ExecutionStatus.SUCCESS,
                    completedAt: new Date(),
                    output: nodeOutputs,
                },
            });
        });

        return {
            workflowId,
            result: nodeOutputs,
        };
    }
);

