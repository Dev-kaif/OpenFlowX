import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { agentChannel } from "@/inngest/channels/agent";
import Handlebars from "handlebars";
import { generateText, tool, stepCountIs } from "ai";
import { createAIModel } from "@/features/ai/ai";
import { jsonSchema } from "ai";
import prisma from "@/lib/db";
import { decryptApiKey } from "@/lib/crypto";
import { getExecutor } from "@/features/executions/lib/executorRegistory";
import { NodeType } from "@/generated/prisma/enums";
import { AGENT_TOOLS } from "../toolRegistry";

function extractTextFromSteps(steps: any[]): string {
    for (const step of steps) {
        if (step.text && typeof step.text === "string" && step.text.trim()) {
            return step.text.trim();
        }
        for (const chunk of step.content ?? []) {
            if (chunk.type === "text" && chunk.text) {
                return chunk.text.trim();
            }
        }
    }
    return "";
}

export type ConnectedTool = {
    type: string;
    id: string;
    data: any;
};

type AgentNodeData = {
    prompt?: string;
    credentialId?: string;
    variableName?: string;
    model?: string;
    provider?: string;
    maxSteps?: number;
    connectedTools?: ConnectedTool[];
};

export const AgentExecutor: NodeExecutor<AgentNodeData> = async ({
    data,
    nodeId,
    userId,
    context,
    step,
    publish,
}) => {
    await publish(agentChannel().status({ nodeId, status: "loading" }));

    if (!data.variableName) {
        await publish(agentChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError("Agent Node: 'variableName' field is required");
    }
    if (!data.prompt) {
        await publish(agentChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError("Agent Node: 'prompt' field is required");
    }
    if (!data.credentialId) {
        await publish(agentChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError("Agent Node: 'credentialId' field is required");
    }
    if (!userId) {
        await publish(agentChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError("Agent Node: userId is missing from execution context");
    }

    try {
        const apiKey = await step.run("get-agent-api-key", async () => {
            const cred = await prisma.credential.findUniqueOrThrow({
                where: { id: data.credentialId, userId },
                select: { value: true },
            });
            return decryptApiKey(cred.value);
        });

        const compiledPrompt = Handlebars.compile(data.prompt, { noEscape: true })(context);
        const modelConfig = data.model || "gpt-4o-mini";
        const provider = (data.provider || "openrouter") as any;

        const client = createAIModel({ provider, model: modelConfig, apiKey });

        // Build tools using tool() with inputSchema (AI SDK v5 format)
        const aiTools: Record<string, any> = {};
        const toolsToLoad = data.connectedTools || [];

        for (const toolNode of toolsToLoad) {
            const registryEntry = AGENT_TOOLS[toolNode.type as NodeType];
            if (!registryEntry) continue;

            // Capture for closure
            const capturedEntry = registryEntry;
            const capturedNode = toolNode;

            aiTools[capturedEntry.name] = tool({
                description: capturedEntry.description,
                inputSchema: jsonSchema({
                    type: "object",
                    properties: capturedEntry.schema.properties,
                    required: capturedEntry.schema.required ?? [],
                }),
                execute: async (args: any) => {
                    try {
                        const executorFn = getExecutor(capturedNode.type as NodeType);
                        if (!executorFn) return `Error: No executor found for tool type ${capturedNode.type}`;

                        const mergedData = capturedEntry.mapArgs(args, capturedNode.data);
                        const mockStep = {
                            run: async (_name: string, fn: () => Promise<any>) => await fn(),
                            sleep: async () => { },
                            ai: step.ai,
                        } as any;

                        const rawOutput = await executorFn({
                            data: mergedData,
                            nodeId: capturedNode.id,
                            userId,
                            context,
                            step: mockStep,
                            publish: async () => { },
                        });

                        const actualResult = rawOutput[mergedData.variableName!];
                        if (actualResult === undefined || actualResult === null) return "Tool returned no output.";
                        if (typeof actualResult === "object") {
                            return actualResult.text ?? JSON.stringify(actualResult).substring(0, 15000);
                        }
                        return String(actualResult);
                    } catch (e: any) {
                        return `Error executing tool: ${e.message}`;
                    }
                },
            });
        }

        // stopWhen replaces maxSteps in AI SDK v5
        const { text, steps } = await generateText({
            model: client,
            system: "You are an autonomous AI Agent. Use your available tools to fulfill the user's request. If you do not have a tool for a specific task, try to answer to the best of your ability.",
            prompt: compiledPrompt,
            tools: Object.keys(aiTools).length > 0 ? aiTools : undefined,
            stopWhen: stepCountIs(data.maxSteps ?? 10),
        });

        const finalText = text || extractTextFromSteps(steps);

        await publish(agentChannel().status({ nodeId, status: "success" }));

        return {
            [data.variableName]: {
                text: finalText,
                raw: steps,
            },
        };
    } catch (error: any) {
        console.error("AGENT EXECUTOR ERROR:", error);
        await publish(agentChannel().status({ nodeId, status: "error" }));
        throw new NonRetriableError(
            error?.message || "Unknown Agent Execution Error"
        );
    }
};
