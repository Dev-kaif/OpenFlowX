import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { generateText } from "ai";
import { createAIModel, extractTextFromSteps } from "@/features/ai/ai";
import { decryptApiKey } from "@/lib/crypto";
import prisma from "@/lib/db";
import { anthropicChannel } from "@/inngest/channels/anthropic";


Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    return new Handlebars.SafeString(jsonString);
});


type AnthropicProps = {
    variableName?: string;
    model?: string;
    userPrompt?: string;
    systemPrompt?: string;
    credentialId?: string;
};


export const AnthropicExecutor: NodeExecutor<AnthropicProps> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
    userId
}) => {
    await publish(
        anthropicChannel().status({
            nodeId,
            status: "loading",
        }),
    );

    if (!data.variableName) {
        await publish(
            anthropicChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError(
            "Anthropic Node: No variable name configured",
        );
    }

    if (!data.userPrompt) {
        await publish(
            anthropicChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError(
            "Anthropic Node: No user prompt configured",
        );
    }

    if (!data.credentialId) {
        await publish(
            anthropicChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("Anthropic Node: No API key configured");
    }


    const apiKey = await step.run("get-api-key", async () => {
        const cred = await prisma.credential.findUniqueOrThrow({
            where: {
                id: data.credentialId,
                userId
            },
            select: {
                value: true
            },
        });

        return decryptApiKey(cred.value);
    });


    const systemPrompt = data.systemPrompt
        ? Handlebars.compile(data.systemPrompt)(context)
        : "You are a helpful assistant.";

    const userPrompt = Handlebars.compile(data.userPrompt)(context);

    const model = data.model || "claude-3.7-sonnet";

    const client = await createAIModel({
        provider: "anthropic",
        model,
        apiKey,
    });

    try {
        const { steps } = await step.ai.wrap(
            "anthropic-generate-text",
            generateText,
            {
                model: client,
                system: systemPrompt,
                prompt: userPrompt,
            },
        );

        const text = extractTextFromSteps(steps);

        await publish(
            anthropicChannel().status({
                nodeId,
                status: "success",
            }),
        );

        return {
            ...context,
            [data.variableName]: {
                text,
                raw: steps,
            },
        };
    } catch (error) {
        await publish(
            anthropicChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw error;
    }
};
