import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars"
import { openRouterChannel } from "@/inngest/channels/openrouter";
import { generateText } from "ai"
import { createAIModel, extractTextFromSteps } from "@/features/ai/ai";
import { decryptApiKey } from "@/lib/crypto";
import prisma from "@/lib/db";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);
    return safeString;
})

type OpenrouterProps = {
    variableName?: string;
    model?: string;
    userPrompt?: string;
    systemPrompt?: string;
    credentialId?: string;
}

export const OpenRouterExecutor: NodeExecutor<OpenrouterProps> = async ({
    data,
    nodeId,
    context,
    userId,
    step,
    publish
}) => {

    await publish(
        openRouterChannel().status({
            nodeId,
            status: "loading"
        }),
    );

    if (!data.credentialId) {
        await publish(
            openRouterChannel().status({
                nodeId,
                status: "error"
            }),
        );
        throw new NonRetriableError("OpenRouter Node : No API KEY configured");
    }

    if (!data.variableName) {
        await publish(
            openRouterChannel().status({
                nodeId,
                status: "error"
            }),
        );
        throw new NonRetriableError("OpenRouter Node : No Varible Name configured");
    }


    const apiKey = await step.run("get-api-key", async () => {
        const cred = await prisma.credential.findUniqueOrThrow({
            where: {
                id: data.credentialId,
                userId
            },
            select: {
                value: true
            }
        });
        const decryptedKey = decryptApiKey(cred.value);
        return decryptedKey
    })

    const systemPrompt = data.systemPrompt ?
        Handlebars.compile(data.systemPrompt)(context)
        : "You are helpful assistant";

    const userPrompt = Handlebars.compile(data.userPrompt)(context);
    const model = (data.model || "openai/gpt-4o-mini")

    const client = await createAIModel({
        provider: "openrouter",
        model,
        apiKey
    })

    try {
        const { steps } = await step.ai.wrap("openrouter-generate-text", generateText,
            {
                model: client,
                system: systemPrompt,
                prompt: userPrompt,
            }
        );

        const text = extractTextFromSteps(steps);
        console.log(text)

        await publish(
            openRouterChannel().status({
                nodeId,
                status: "success"
            }),
        );

        return {
            ...context,
            [data.variableName]: {
                text: text,
                raw: steps
            }
        }

    } catch (error) {
        await publish(
            openRouterChannel().status({
                nodeId,
                status: "error"
            }),
        );
        throw error
    }
}