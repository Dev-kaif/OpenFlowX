import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars"
import { geminiChannel } from "@/inngest/channels/gemini";
import { generateText } from "ai"
import { createAIModel, extractTextFromSteps } from "@/features/ai/ai";

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
}

export const GeminiExecutor: NodeExecutor<GeminiProps> = async ({
    data,
    nodeId,
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

    const systemPrompt = data.systemPrompt ?
        Handlebars.compile(data.systemPrompt)(context)
        : "You are helpful assistant";

    const userPrompt = Handlebars.compile(data.userPrompt)(context);
    const apiKey = process.env.GEMINI_API_KEY!
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
        console.log(text)

        await publish(
            geminiChannel().status({
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
            geminiChannel().status({
                nodeId,
                status: "error"
            }),
        );
        throw error
    }
}