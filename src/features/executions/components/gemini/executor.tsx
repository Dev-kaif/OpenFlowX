import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars"
import { geminiChannel } from "@/inngest/channels/gemini";
import { generateText } from "ai"
import { createAIModel, extractTextFromSteps } from "@/features/ai/ai";
import prisma from "@/lib/db";
import { decryptApiKey } from "@/lib/crypto";

Handlebars.registerHelper("json", (context) => {
    const jsonString = JSON.stringify(context, null, 2);
    const safeString = new Handlebars.SafeString(jsonString);
    return safeString;
})

type GeminiProps = {
    variableName?: string;
    model?: string;
    userPrompt?: string;
    systemPrompt?: string;
    credentialId?: string;
}

export const GeminiExecutor: NodeExecutor<GeminiProps> = async ({
    data,
    nodeId,
    userId,
    context,
    step,
    publish
}) => {

    await publish(
        geminiChannel().status({
            nodeId,
            status: "loading"
        }),
    );

    if (!data.variableName) {
        await publish(
            geminiChannel().status({
                nodeId,
                status: "error"
            }),
        );
        throw new NonRetriableError("Gemini Node : No Varible Name configured");
    }

    if (!data.userPrompt) {
        await publish(
            geminiChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw new NonRetriableError("OpenAI Node: No user prompt configured");
    }


    if (!data.credentialId) {
        await publish(
            geminiChannel().status({
                nodeId,
                status: "error"
            }),
        );
        throw new NonRetriableError("Gemini Node : No API KEY configured");
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
    const model = (data.model || "gemini-flash-latest")

    const client = await createAIModel({
        provider: "google",
        model,
        apiKey
    })

    try {
        const { steps } = await step.ai.wrap("gemini-generate-text", generateText,
            {
                model: client,
                system: systemPrompt,
                prompt: userPrompt,
            }
        );

        const text = extractTextFromSteps(steps);

        await publish(
            geminiChannel().status({
                nodeId,
                status: "success"
            }),
        );

        return {
            [data.variableName]: {
                text: text,
                raw: steps
            }
        }

    } catch (error) {
        await publish(
            geminiChannel().status({
                nodeId,
                status: "error"
            }),
        );
        throw error
    }
}