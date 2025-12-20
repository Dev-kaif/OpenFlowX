"use client";

import type { NodeProps } from "@xyflow/react";
import { PlusIcon } from "lucide-react";
import { memo } from "react";
import { PlaceholderNode } from "./placeholder-node";
import { WorkflowNode } from './workflowNode';

export const InitialNode = memo((props: NodeProps) => {
    return (
        <WorkflowNode>
            <PlaceholderNode
                {...props}
            >
                <div className="size-full cursor-pointer items-center justify-center flex">
                    <PlusIcon className="size-4" />
                </div>
            </PlaceholderNode>
        </WorkflowNode>
    );
});

InitialNode.displayName = "InitialNode";