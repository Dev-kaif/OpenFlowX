import { InitialNode } from "@/components/reactFlow/initialNode";
import { NodeType } from "@/generated/prisma/enums";
import { NodeTypes } from "@xyflow/react";

export const nodeComponents = {
    [NodeType.INITIAL]: InitialNode,
} as const satisfies NodeTypes;

export type RegisteredNodeTypes = keyof typeof nodeComponents;

