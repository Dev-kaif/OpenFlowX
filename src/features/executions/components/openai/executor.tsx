import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { generateText } from "ai";
import { createAIModel, extractTextFromSteps } from "@/features/ai/ai";
import { decryptApiKey } from "@/lib/crypto";
import prisma from "@/lib/db";
import { openAIChannel } from "@/inngest/channels/openAi";


Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    return new Handlebars.SafeString(jsonString);
});



type OpenAIProps = {
    variableName?: string;
    model?: string;
    userPrompt?: string;
    systemPrompt?: string;
    credentialId?: string;
};



export const OpenAIExecutor: NodeExecutor<OpenAIProps> = async ({
    data,
    nodeId,
    context,
    step,
    userId,
    publish,
}) => {
    await publish(
        openAIChannel().status({
            nodeId,
            status: "loading",
        }),
    );


    if (!data.variableName) {
        await publish(
            openAIChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("OpenAI Node: No variable name configured");
    }

    if (!data.userPrompt) {
        await publish(
            openAIChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("OpenAI Node: No user prompt configured");
    }


    if (!data.credentialId) {
        await publish(
            openAIChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("OpenAI Node: No API key configured");
    }


    const apiKey = await step.run("get-api-key", async () => {
        const cred = await prisma.credential.findUniqueOrThrow({
            where: {
                id: data.credentialId,
                userId,
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

    const model = data.model || "gpt-4o-mini";


    const client = await createAIModel({
        provider: "openai",
        model,
        apiKey,
    });

    try {
        const { steps } = await step.ai.wrap(
            "openai-generate-text",
            generateText,
            {
                model: client,
                system: systemPrompt,
                prompt: userPrompt,
            },
        );

        const text = extractTextFromSteps(steps);

        await publish(
            openAIChannel().status({
                nodeId,
                status: "success",
            }),
        );

        return {
            [data.variableName]: {
                text,
                raw: steps,
            },
        };
    } catch (error) {
        await publish(
            openAIChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw error;
    }
};
