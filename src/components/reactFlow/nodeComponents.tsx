import { InitialNode } from "@/components/reactFlow/initialNode";
import { NodeType } from "@/generated/prisma/enums";
import { NodeTypes } from "@xyflow/react";
import { HttpRequestNode } from "../executions/components/httpRequest/node";

export const nodeComponents = {
    [NodeType.INITIAL]: InitialNode,
    [NodeType.HTTP_REQUEST]:HttpRequestNode,
    // [NodeType.MANUAL_TRIGGER]:ManualTriggerNode,
} as const satisfies NodeTypes;

export type RegisteredNodeTypes = keyof typeof nodeComponents;

