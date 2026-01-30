import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";
import { generateText } from "ai";
import { createAIModel, extractTextFromSteps } from "@/features/ai/ai";
import { decryptApiKey } from "@/lib/crypto";
import prisma from "@/lib/db";
import { deepseekChannel } from "@/inngest/channels/deepseek";


Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    return new Handlebars.SafeString(jsonString);
});


type DeepSeekProps = {
    variableName?: string;
    model?: string;
    userPrompt?: string;
    systemPrompt?: string;
    credentialId?: string;
};


export const DeepSeekExecutor: NodeExecutor<DeepSeekProps> = async ({
    data,
    nodeId,
    context,
    step,
    publish,
}) => {
    await publish(
        deepseekChannel().status({
            nodeId,
            status: "loading",
        }),
    );


    if (!data.variableName) {
        await publish(
            deepseekChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("DeepSeek Node: No variable name configured");
    }

    if (!data.userPrompt) {
        await publish(
            deepseekChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("DeepSeek Node: No user prompt configured");
    }

    if (!data.credentialId) {
        await publish(
            deepseekChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("DeepSeek Node: No API key configured");
    }


    const apiKey = await step.run("get-api-key", async () => {
        const cred = await prisma.credential.findUniqueOrThrow({
            where: { id: data.credentialId },
            select: { value: true },
        });

        return decryptApiKey(cred.value);
    });


    const systemPrompt = data.systemPrompt
        ? Handlebars.compile(data.systemPrompt)(context)
        : "You are a helpful assistant.";

    const userPrompt = Handlebars.compile(data.userPrompt)(context);


    const model = data.model || "deepseek-chat";

    const client = await createAIModel({
        provider: "deepseek",
        model,
        apiKey,
    });


    try {
        const { steps } = await step.ai.wrap(
            "deepseek-generate-text",
            generateText,
            {
                model: client,
                system: systemPrompt,
                prompt: userPrompt,
            },
        );

        const text = extractTextFromSteps(steps);

        await publish(
            deepseekChannel().status({
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
            deepseekChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw error;
    }
};
