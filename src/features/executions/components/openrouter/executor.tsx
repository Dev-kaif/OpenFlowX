import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars"
import { openRouterChannel } from "@/inngest/channels/openrouter";
import { generateText } from "ai"
import { createAIModel, extractTextFromSteps } from "@/features/ai/ai";

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
}

export const OpenRouterExecutor: NodeExecutor<OpenrouterProps> = async ({
    data,
    nodeId,
    context,
    step,
    publish
}) => {

    await publish(
        openRouterChannel().status({
            nodeId,
            status: "loading"
        }),
    );

    if (!data.variableName) {
        await publish(
            openRouterChannel().status({
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
    const apiKey = process.env.OPENROUTER_API_KEY!
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