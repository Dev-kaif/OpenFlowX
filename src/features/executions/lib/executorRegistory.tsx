import { NodeType } from "@/generated/prisma/enums";
import { NodeExecutor } from "../types";
import { manualExecutionTrigger } from "@/features/trigger/components/manualTrigger/executor";
import { googleFormTriggerExecution } from "@/features/trigger/components/googleFormTrigger/executor";
import { httpRequestTrigger } from "../components/httpRequest/executor";
import { stripeTriggerExecution } from "@/features/trigger/components/stripeTrigger/executor";
import { polarTriggerExecution } from "@/features/trigger/components/polarTrigger/executor";
import { GeminiExecutor } from "../components/gemini/executor";
import { OpenRouterExecutor } from "../components/openrouter/executor";
import { OpenAIExecutor } from "../components/openai/executor";
import { DeepSeekExecutor } from "../components/deepseek/executor";
import { AnthropicExecutor } from "../components/anthropic/executor";
import { GrokExecutor } from "../components/grok/executor";
import { DiscordExecutor } from "../components/discord/executor";
import { SlackExecutor } from "../components/slack/executor";
import { IfNodeExecutor } from "../components/UtilsNodes/ifElseNode/executor";
import { DelayExecutor } from "../components/UtilsNodes/delay/executor";
import { CodeExecutor } from "../components/UtilsNodes/code/executor";
import { TemplateExecutor } from "../components/UtilsNodes/template/executor";
import { SearchExecutor } from "../components/UtilsNodes/search/executor";
import { ScraperExecutor } from "../components/UtilsNodes/scraper/executor";
import { PostgresExecutor } from "../components/postgress/executor";
import { GoogleSheetsExecutor } from "../components/googleSheets/executor";
import { ScheduleExecutor } from "@/features/trigger/components/schedule/executor";
import { ResendExecutor } from "../components/resend/executor";


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
    [NodeType.TEMPLATE]: TemplateExecutor,
    [NodeType.SEARCH]: SearchExecutor,
    [NodeType.SCRAPER]: ScraperExecutor,
    [NodeType.POSTGRESS]: PostgresExecutor,
    [NodeType.GOOGLESHEETS]: GoogleSheetsExecutor,
    [NodeType.SCHEDULE]: ScheduleExecutor,
    [NodeType.EMAIL_RESEND]: ResendExecutor,
};


export const getExecutor = (type: NodeType): NodeExecutor => {
    const executor = executorRegistory[type];
    if (!executor) {
        throw new Error("No executor found for node type")
    }

    return executor;
}