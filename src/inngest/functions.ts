import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";

import { topologicalSort } from "./utils/topoSort";
import { getReachableNodeIds } from "./utils/reachability";
import { buildNodeInput, buildParentsMap } from "./utils/parents";

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
import { discordChannel } from "./channels/discord";
import { slackChannel } from "./channels/slack";
import { ifElseChannel } from "./channels/ifElse";
import { disableSubtree } from "./utils/disable";

const TRIGGER_NODE_TYPES: NodeType[] = [
    NodeType.INITIAL,
    NodeType.MANUAL_TRIGGER,
    NodeType.GOOGLE_FORM_TRIGGER,
    NodeType.STRIPE_TRIGGER,
    NodeType.POLAR_TRIGGER,
];

const BRANCH_CONDITIONS = ["true", "false"];

export const executeWorkflow = inngest.createFunction(
    {
        id: "execute-workflow",
        retries: process.env.NODE_ENV === "production" ? 3 : 0,
        onFailure: async ({ event }) => {
            return prisma.execution.update({
                where: { inngestEventId: event.data.event.id },
                data: {
                    status: ExecutionStatus.FAILED,
                    error: event.data.error.message,
                    errorStack: event.data.error.stack,
                },
            });
        },
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
            discordChannel(),
            slackChannel(),
            ifElseChannel(),
        ],
    },
    async ({ event, step, publish }) => {

        const workflowId = event.data.workflowId;
        const inngestEventId = event.id;

        if (!workflowId || !inngestEventId) {
            throw new NonRetriableError("Missing workflowId or eventId");
        }

        // Create execution
        await step.run("create-execution", () =>
            prisma.execution.create({
                data: { workflowId, inngestEventId },
            })
        );

        // Load workflow
        const workflow = await step.run("load-workflow", () =>
            prisma.workflow.findUniqueOrThrow({
                where: { id: workflowId },
                include: { nodes: true, connections: true },
            })
        );

        const userId = workflow.userId;

        // Identify triggers
        const triggerNodeIds = workflow.nodes
            .filter((n) => TRIGGER_NODE_TYPES.includes(n.type as NodeType))
            .map((n) => n.id);

        if (triggerNodeIds.length === 0) {
            throw new NonRetriableError("Workflow has no trigger node");
        }

        // Reachability filtering
        const reachableNodeIds = getReachableNodeIds(
            triggerNodeIds,
            workflow.connections
        );

        const executableNodes = workflow.nodes.filter((n) =>
            reachableNodeIds.has(n.id)
        );

        const executableConnections = workflow.connections.filter(
            (c) =>
                reachableNodeIds.has(c.fromNodeId) &&
                reachableNodeIds.has(c.toNodeId)
        );

        // Topological order
        const sortedNodes = await step.run("toposort", () =>
            topologicalSort(executableNodes, executableConnections)
        );

        // Build Map for Data Passing
        const parentsMap = buildParentsMap(executableConnections);
        const nodeOutputs: Record<string, any> = {};

        // Track disabled nodes
        let disabledIds: string[] = [];

        for (const node of sortedNodes) {

            // Skip nodes that were disabled by If/Else branches
            if (disabledIds.includes(node.id)) {
                continue;
            }

            const executor = getExecutor(node.type as NodeType);

            if (!executor) {
                throw new NonRetriableError(
                    `No executor registered for node type ${node.type}`
                );
            }

            const context = triggerNodeIds.includes(node.id)
                ? event.data.initialData || {}
                : buildNodeInput(node.id, parentsMap, nodeOutputs, triggerNodeIds);

            const output = await executor({
                nodeId: node.id,
                data: node.data as Record<string, unknown>,
                context,
                userId,
                step,
                publish,
            });

            nodeOutputs[node.id] = output;

            // If Else logic
            // Check for outgoing connections that represent true or flase decision
            const outgoingChoices = executableConnections.filter(
                (c) => c.fromNodeId === node.id &&
                    c.fromOutput &&
                    BRANCH_CONDITIONS.includes(c.fromOutput)
            );

            if (outgoingChoices.length > 0) {

                // Calculate which paths to disable based on the node's result
                const branchDisabled = await step.run(`branch-check-${node.id}`, () => {

                    const currentDisabled = new Set<string>();

                    // Safely extract boolean result (default to false if missing)
                    const key = Object.keys(output)[0];
                    const result = Boolean(output[key]?.result);

                    for (const c of outgoingChoices) {
                        // Logic: Is this the path we should take?
                        const shouldRun =
                            (c.fromOutput === "true" && result) ||
                            (c.fromOutput === "false" && !result);

                        // If not, recursively disable that entire subtree
                        if (!shouldRun) {
                            disableSubtree(
                                c.toNodeId,
                                executableConnections,
                                currentDisabled
                            );
                        }
                    }
                    return Array.from(currentDisabled);
                });

                // Update the persisted list of disabled nodes
                disabledIds = [...new Set([...disabledIds, ...branchDisabled])];
            }
        }

        // Finalize
        await step.run("update-execution", () =>
            prisma.execution.update({
                where: { workflowId, inngestEventId },
                data: {
                    status: ExecutionStatus.SUCCESS,
                    completedAt: new Date(),
                    output: nodeOutputs,
                },
            })
        );

        return {
            workflowId,
            result: nodeOutputs,
        };
    }
);

