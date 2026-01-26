import { InitialNode } from "@/components/reactFlow/initialNode";
import { NodeType } from "@/generated/prisma/enums";
import { NodeTypes } from "@xyflow/react";
import { HttpRequestNode } from "@/features/executions/components/httpRequest/node";
import { ManualTriggerNode } from "@/features/trigger/components/manualTrigger/node";
import { GoogleFormTriggerNode } from "@/features/trigger/components/googleFormTrigger/node";

export const nodeComponents = {
    [NodeType.INITIAL]: InitialNode,
    [NodeType.HTTP_REQUEST]: HttpRequestNode,
    [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
    [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
} as const satisfies NodeTypes;

export type RegisteredNodeTypes = keyof typeof nodeComponents;

