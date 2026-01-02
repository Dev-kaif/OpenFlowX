import { Position} from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import { memo, ReactNode } from "react";
import Image from "next/image";
import { BaseHandle } from "@/components/reactFlow/base-handle";
import { BaseNodeContent ,BaseNode} from '@/components/reactFlow/base-node';
import { WorkflowNode } from "@/components/reactFlow/workflowNode";


interface BaseTriggerProps{
    icon: LucideIcon | string;
    name: string;
    description?: string;
    children?: ReactNode;
    // status?:NodeStatus
    onSetting?: () => void;
    onDoubleClick?: () => void;
}

export const BaseTriggerNode = memo(({
    icon:Icon,
    name,
    description,
    children,
    onDoubleClick,
    onSetting
}: BaseTriggerProps) => {

    const handleDelete = ()=>{}
    
    return (
        <WorkflowNode
            name={name}
            description={description}
            onDelete={handleDelete}
            onSetting={onSetting}
            showToolbar={true}
        >
            <BaseNode
                className="rounded-l-2xl relative group"
                onDoubleClick={onDoubleClick}
            >
                <BaseNodeContent>
                    {typeof Icon == "string" ? (
                        <Image alt={name} src={Icon} height={16} width={16} />
                    ): (
                        <Icon className="size-4 text-muted-foreground" />   
                    )}
                    {children}
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

BaseTriggerNode.displayName = "BaseTriggerNode";