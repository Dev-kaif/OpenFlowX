"use client";

import type { NodeProps } from "@xyflow/react";
import { PlusIcon } from "lucide-react";
import { memo, useState } from "react";
import { PlaceholderNode } from "./placeholder-node";
import { WorkflowNode } from './workflowNode';
import { NodeSelector } from "./nodeSelector";

export const InitialNode = memo((props: NodeProps) => {
    const [selectorOpen, setSelectoOpen] = useState(false);
    
    return (
        <WorkflowNode>
            <NodeSelector open={selectorOpen} onOpenChange={setSelectoOpen}>
                <PlaceholderNode
                    {...props}
                    onClick={()=>setSelectoOpen(true)}
                >
                    <div className="size-full cursor-pointer items-center justify-center flex">
                        <PlusIcon className="size-4" />
                    </div>
                </PlaceholderNode>
            </NodeSelector>
        </WorkflowNode>
    );
});

InitialNode.displayName = "InitialNode";