import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { agentChannel } from "@/inngest/channels/agent";
import Handlebars from "handlebars";
import prisma from "@/lib/db";
import { decryptApiKey } from "@/lib/crypto";
import { getExecutor } from "@/features/executions/lib/executorRegistory";
import { NodeType } from "@/generated/prisma/enums";
import { AGENT_TOOLS } from "../toolRegistry";

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

        const compiledPrompt = Handlebars.compile(data.prompt, {
            noEscape: true,
        })(context);

        const modelConfig = data.model || "gpt-4o-mini";

        // Build raw tool definitions
        const aiTools: Record<string, any> = {};
        const toolsToLoad = data.connectedTools || [];

        for (const toolNode of toolsToLoad) {
            const registryEntry = AGENT_TOOLS[toolNode.type as NodeType];

            if (!registryEntry) {
                continue;
            }

            aiTools[registryEntry.name] = {
                description: registryEntry.description,
                parameters: {
                    type: "object",
                    properties: registryEntry.schema.properties,
                    required: registryEntry.schema.required ?? [],
                },
                execute: async (args: any) => {

                    try {
                        const executorFn = getExecutor(toolNode.type as NodeType);

                        if (!executorFn) {
                            return `Error: No executor found for tool type ${toolNode.type}`;
                        }

                        const mergedData = registryEntry.mapArgs(args, toolNode.data);

                        const mockStep = {
                            run: async (_name: string, fn: () => Promise<any>) => await fn(),
                            sleep: async () => { },
                            ai: step.ai,
                        } as any;

                        const rawOutput = await executorFn({
                            data: mergedData,
                            nodeId: toolNode.id,
                            userId,
                            context,
                            step: mockStep,
                            publish: async () => { },
                        });

                        const actualResult = rawOutput[mergedData.variableName!];

                        if (actualResult === undefined || actualResult === null) {
                            return "Tool returned no output.";
                        }

                        if (typeof actualResult === "object") {
                            return actualResult.text
                                ?? JSON.stringify(actualResult).substring(0, 15000);
                        }

                        return String(actualResult);
                    } catch (e: any) {
                        console.error(`[Agent Tool Error] ${registryEntry.name}:`, e);
                        return `Error executing tool: ${e.message}`;
                    }
                },
            };
        }


        // Build OpenRouter-format tools array
        const openRouterTools = Object.entries(aiTools).map(([name, toolDef]) => ({
            type: "function",
            function: {
                name,
                description: toolDef.description,
                parameters: toolDef.parameters,
            },
        }));


        // Agentic loop
        const messages: any[] = [
            {
                role: "system",
                content: "You are an autonomous AI Agent. Use your available tools to fulfill the user's request. If you do not have a tool for a specific task, try to answer to the best of your ability.",
            },
            {
                role: "user",
                content: compiledPrompt,
            },
        ];

        let finalText = "";
        const maxSteps = data.maxSteps ?? 10;

        for (let i = 0; i < maxSteps; i++) {

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: modelConfig,
                    messages,
                    tools: openRouterTools.length > 0 ? openRouterTools : undefined,
                    tool_choice: openRouterTools.length > 0 ? "auto" : undefined,
                }),
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`OpenRouter API error (${response.status}): ${err}`);
            }

            const result = await response.json();
            const choice = result.choices?.[0];
            const message = choice?.message;

            if (!message) {
                throw new Error("OpenRouter returned no message in response");
            }

            // Add assistant turn to history
            messages.push(message);

            // No tool calls — agent is done
            if (!message.tool_calls || message.tool_calls.length === 0) {
                finalText = message.content ?? "";
                break;
            }


            // Execute each tool call and collect results
            for (const toolCall of message.tool_calls) {
                const toolName = toolCall.function.name;
                const toolArgs = JSON.parse(toolCall.function.arguments || "{}");
                const toolDef = aiTools[toolName];


                let toolResult = `Error: tool "${toolName}" not found.`;

                if (toolDef?.execute) {
                    toolResult = await toolDef.execute(toolArgs);
                }

                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify({
                        tool: toolName,
                        result: toolResult
                    })
                });
            }

            // If we hit maxSteps, extract whatever text we have
            if (i === maxSteps - 1) {
                finalText = message.content ?? "Agent reached maximum steps without a final answer.";
            }
        }

        await publish(agentChannel().status({ nodeId, status: "success" }));

        return {
            [data.variableName]: {
                text: finalText,
                raw: messages,
            },
        };

    } catch (error: any) {
        console.error("AGENT EXECUTOR ERROR:", error);
        console.error("Provider response:", error?.response?.data);
        console.error("Provider cause:", error?.cause);

        await publish(agentChannel().status({ nodeId, status: "error" }));

        throw new NonRetriableError(
            error?.response?.data?.error?.message ||
            error?.message ||
            "Unknown Agent Execution Error"
        );
    }
};