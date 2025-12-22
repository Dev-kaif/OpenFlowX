import { Position, type NodeProps } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import { memo, ReactNode } from "react";
import { WorkflowNode } from "../reactFlow/workflowNode";
import { BaseNode, BaseNodeContent } from "../reactFlow/base-node";
import Image from "next/image";
import { BaseHandle } from "../reactFlow/base-handle";


interface BaseExecutionProps{
    icon: LucideIcon | string;
    name: string;
    description?: string;
    children?: ReactNode;
    // status?:NodeStatus
    onSetting?: () => void;
    onDoubleClick?: () => void;
}

export const BaseExecutionNode = memo(({
    icon:Icon,
    name,
    description,
    children,
    onDoubleClick,
    onSetting
}: BaseExecutionProps) => {

    const handleDelete = ()=>{}
    
    return (
        <WorkflowNode
            name={name}
            description={description}
            onDelete={handleDelete}
            onSetting={onSetting}
        >
            <BaseNode onDoubleClick={onDoubleClick}>
                <BaseNodeContent>
                    {typeof Icon == "string" ? (
                        <Image alt={name} src={Icon} height={16} width={16} />
                    ): (
                        <Icon className="size-4 text-muted-foreground" />   
                    )}
                    {children}
                    <BaseHandle
                        id={"target-1"}
                        type="target"
                        position={Position.Left}
                    />
                    <BaseHandle
                        id={"source-1"}
                        type="source"
                        position={Position.Right}
                    />
                </BaseNodeContent>
            </BaseNode>
        </WorkflowNode>
    );
});

BaseExecutionNode.displayName = "BaseExecutionNode";