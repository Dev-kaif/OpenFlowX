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
} as const satisfies NodeTypes;

export type RegisteredNodeTypes = keyof typeof nodeComponents;

