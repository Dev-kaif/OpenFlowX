import { InitialNode } from "@/components/reactFlow/initialNode";
import { NodeType } from "@/generated/prisma/enums";
import { NodeTypes } from "@xyflow/react";
import { HttpRequestNode } from "@/features/executions/components/httpRequest/node";
import { ManualTriggerNode } from "@/features/trigger/components/manualTrigger/node";
import { GoogleFormTriggerNode } from "@/features/trigger/components/googleFormTrigger/node";
import { StripeTriggerNode } from "@/features/trigger/components/stripeTrigger/node";
import { PolarTriggerNode } from "@/features/trigger/components/polarTrigger/node";
import { GeminiNode } from "@/features/executions/components/gemini/node";
import { OpenRouterNode } from "@/features/executions/components/openrouter/node";
import { OpenAINode } from "@/features/executions/components/openai/node";
import { DeepseekNode } from "@/features/executions/components/deepseek/node";
import { AnthropicNode } from "@/features/executions/components/anthropic/node";
import { GrokNode } from "@/features/executions/components/grok/node";
import { DiscordNode } from "@/features/executions/components/discord/node";
import { SlackNode } from "@/features/executions/components/slack/node";
import { IfElseNode } from "@/features/executions/components/UtilsNodes/ifElseNode/node";
import { DelayNode } from "@/features/executions/components/UtilsNodes/delay/node";
import { CodeNode } from "@/features/executions/components/UtilsNodes/code/node";

export const nodeComponents = {
    [NodeType.INITIAL]: InitialNode,
    [NodeType.HTTP_REQUEST]: HttpRequestNode,
    [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
    [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
    [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
    [NodeType.POLAR_TRIGGER]: PolarTriggerNode,
    [NodeType.GEMINI]: GeminiNode,
    [NodeType.OPENROUTER]: OpenRouterNode,
    [NodeType.OPENAI]: OpenAINode,
    [NodeType.DEEPSEEK]: DeepseekNode,
    [NodeType.ANTHROPIC]: AnthropicNode,
    [NodeType.XAI]: GrokNode,
    [NodeType.DISCORD]: DiscordNode,
    [NodeType.SLACK]: SlackNode,
    [NodeType.IFELSE]: IfElseNode,
    [NodeType.DELAY]: DelayNode,
    [NodeType.CODE]: CodeNode,
} as const satisfies NodeTypes;

export type RegisteredNodeTypes = keyof typeof nodeComponents;

