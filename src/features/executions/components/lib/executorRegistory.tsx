import { NodeType } from "@/generated/prisma/enums";
import { NodeExecutor } from "../../types";
import { manualExecutionTrigger } from "@/features/trigger/components/manualTrigger/executor";
import { httpRequestTrigger } from "../httpRequest/executor";
import { googleFormTriggerExecution } from "@/features/trigger/components/googleFormTrigger/executor";
import { polarTriggerExecution } from "@/features/trigger/components/polarTrigger/executor";
import { stripeTriggerExecution } from "@/features/trigger/components/stripeTrigger/executor";
import { GeminiExecutor } from "../gemini/executor";
import { OpenRouterExecutor } from "../openrouter/executor";
import { OpenAIExecutor } from "../openai/executor";
import { DeepSeekExecutor } from "../deepseek/executor";
import { GrokExecutor } from "../grok/executor";
import { AnthropicExecutor } from "../anthropic/executor";
import { DiscordExecutor } from "../discord/executor";
import { SlackExecutor } from "../slack/executor";
import { IfNodeExecutor } from "../UtilsNodes/ifElseNode/executor";
import { DelayExecutor } from "../UtilsNodes/delay/executor";
import { CodeExecutor } from "../UtilsNodes/code/executor";
import { PostgresExecutor } from "../postgress/executor";

export const executorRegistory: Record<NodeType, NodeExecutor> = {
    [NodeType.INITIAL]: manualExecutionTrigger,
    [NodeType.MANUAL_TRIGGER]: manualExecutionTrigger,
    [NodeType.HTTP_REQUEST]: httpRequestTrigger,
    [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecution,
    [NodeType.STRIPE_TRIGGER]: stripeTriggerExecution,
    [NodeType.POLAR_TRIGGER]: polarTriggerExecution,
    [NodeType.GEMINI]: GeminiExecutor,
    [NodeType.OPENROUTER]: OpenRouterExecutor,
    [NodeType.OPENAI]: OpenAIExecutor,
    [NodeType.DEEPSEEK]: DeepSeekExecutor,
    [NodeType.ANTHROPIC]: AnthropicExecutor,
    [NodeType.XAI]: GrokExecutor,
    [NodeType.DISCORD]: DiscordExecutor,
    [NodeType.SLACK]: SlackExecutor,
    [NodeType.IFELSE]: IfNodeExecutor,
    [NodeType.DELAY]: DelayExecutor,
    [NodeType.CODE]: CodeExecutor,
    [NodeType.POSTGRESS]: PostgresExecutor,
};


export const getExecutor = (type: NodeType): NodeExecutor => {
    const executor = executorRegistory[type];
    if (!executor) {
        throw new Error("No executor found for node type")
    }

    return executor;
}