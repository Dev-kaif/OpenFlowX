import { Position, useReactFlow, type NodeProps } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import { memo, ReactNode } from "react";
import { WorkflowNode } from "@/components/reactFlow/workflowNode";
import { BaseNode, BaseNodeContent } from "@/components/reactFlow/base-node";
import { BaseHandle } from "@/components/reactFlow/base-handle";
import { useTheme } from "next-themes";
import { getThemedIcon } from "@/lib/icon";
import { ToolNodeContainer } from "./toolNodeContainer";

interface BaseToolProps extends NodeProps {
    icon: LucideIcon | string;
    name: string;
    description?: string;
    children?: ReactNode;
    onSetting?: () => void;
    onDoubleClick?: () => void;
}

export const BaseToolNode = memo(
    ({ id, icon: Icon, name, description, children, onSetting, onDoubleClick }: BaseToolProps) => {

        const { setNodes, setEdges } = useReactFlow();
        const { theme } = useTheme();
        const currentTheme = theme === "dark" ? "dark" : "light";

        const handleDelete = () => {
            setNodes((nodes) => nodes.filter((node) => node.id !== id));

            setEdges((edges) =>
                edges.filter((edge) => edge.source !== id && edge.target !== id)
            );
        };

        return (
            <ToolNodeContainer
                name={name}
                description={description}
                onDelete={handleDelete}
                onSettings={onSetting}
                showToolbar={true}
            >
                <BaseNode onDoubleClick={onDoubleClick}>
                    <BaseNodeContent className="items-center">

                        {/* ICON */}
                        {typeof Icon === "string" ? (
                            <img
                                src={getThemedIcon(Icon, currentTheme)}
                                alt={name}
                                className="h-4 w-4 object-contain"
                                onError={(e) => {
                                    e.currentTarget.src = Icon;
                                }}
                            />
                        ) : (
                            <Icon className="size-4 text-dark dark:text-white" />
                        )}

                        {children}

                        {/* SOURCE HANDLE TOP */}
                        <BaseHandle
                            id="source-1"
                            type="source"
                            position={Position.Top}
                        />

                    </BaseNodeContent>
                </BaseNode>
            </ToolNodeContainer>
        );
    }
);

BaseToolNode.displayName = "BaseToolNode";