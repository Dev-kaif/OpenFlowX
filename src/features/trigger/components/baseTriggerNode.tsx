import { NodeProps, Position, useReactFlow } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import { memo, ReactNode } from "react";
import Image from "next/image";
import { BaseHandle } from "@/components/reactFlow/base-handle";
import { BaseNodeContent, BaseNode } from '@/components/reactFlow/base-node';
import { WorkflowNode } from "@/components/reactFlow/workflowNode";
import { NodeStatus, NodeStatusIndicator } from "@/components/reactFlow/node-status-indicator";
import { getThemedIcon } from "@/lib/icon";
import { useTheme } from "next-themes";


interface BaseTriggerProps extends NodeProps {
    icon: LucideIcon | string;
    name: string;
    description?: string;
    children?: ReactNode;
    status?: NodeStatus
    onSetting?: () => void;
    onDoubleClick?: () => void;
    onDelete?: () => void;
}

export const BaseTriggerNode = memo(({
    id,
    icon: Icon,
    name,
    description,
    children,
    onDoubleClick,
    onSetting,
    onDelete,
    status = "initial"
}: BaseTriggerProps) => {

    const { setNodes, setEdges } = useReactFlow();
    const { theme } = useTheme();
    const currentTheme = theme === "dark" ? "dark" : "light"

    const handleDelete = () => {
        setNodes((currentNodes) => {
            const updatedNodes = currentNodes.filter((node) => node.id !== id);
            return updatedNodes;
        });
        setEdges((currentEdges) => {
            const updatedEdges = currentEdges.filter(
                (edge) => edge.source !== id && edge.target !== id
            );
            return updatedEdges;
        });
        if (onDelete) onDelete()
    };

    return (
        <WorkflowNode
            name={name}
            description={description}
            onDelete={handleDelete}
            onSetting={onSetting}
            showToolbar={true}
        >
            <NodeStatusIndicator
                status={status}
                variant="border"
                className={"rounded-l-2xl"}
            >
                <BaseNode
                    status={status}
                    className="rounded-l-2xl relative group"
                    onDoubleClick={onDoubleClick}
                >
                    <BaseNodeContent>
                        {typeof Icon == "string" ? (
                            <img
                                src={getThemedIcon(Icon, currentTheme)}
                                alt={name}
                                className="h-4 w-4 object-contain"
                                onError={(e) => {
                                    e.currentTarget.src = Icon;
                                }}
                            />
                        ) : (
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
            </NodeStatusIndicator>
        </WorkflowNode>
    );
});

BaseTriggerNode.displayName = "BaseTriggerNode";