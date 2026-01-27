import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createXai } from "@ai-sdk/xai";
import type { LanguageModel } from "ai";


export type AIProvider =
    | "openai"
    | "openrouter"
    | "anthropic"
    | "google"
    | "deepseek"
    | "xai";

interface CreateModelArgs {
    provider: AIProvider;
    model: string;
    apiKey: string;
}

export function createAIModel({ provider, model, apiKey }: CreateModelArgs): LanguageModel {

    switch (provider) {
        case "openai": {
            const client = createOpenAI({ apiKey });
            return client(model);
        }

        case "openrouter": {
            const client = createOpenAI({
                apiKey,
                baseURL: "https://openrouter.ai/api/v1"
            });
            return client(model) as unknown as LanguageModel;
        }

        case "anthropic": {
            const client = createAnthropic({ apiKey });
            return client(model) as unknown as LanguageModel;
        }

        case "google": {
            const client = createGoogleGenerativeAI({ apiKey });
            return client(model) as unknown as LanguageModel;
        }

        case "deepseek": {
            const client = createDeepSeek({ apiKey });
            return client(model) as unknown as LanguageModel;
        }

        case "xai": {
            const client = createXai({ apiKey });
            return client(model) as unknown as LanguageModel;
        }

        default:
            throw new Error(`Unsupported AI provider: ${provider}`);
    }
}



export function extractTextFromSteps(steps: any[]): string {
    for (const step of steps) {
        for (const chunk of step.content ?? []) {
            if (chunk.type === "text" && chunk.text) {
                return chunk.text.trim();
            }
        }
    }
    return "";
}
