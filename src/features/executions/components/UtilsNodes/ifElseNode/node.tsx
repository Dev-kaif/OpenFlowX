import {
    Position,
    Handle,
    useReactFlow,
    type Node,
    type NodeProps,
} from "@xyflow/react";
import { memo, useState } from "react";
import Image from "next/image";

import { IfElseDialog, IfElseFormValues } from "./dialog";
import { IFELSE_CHANNEL_NAME } from "@/inngest/channels/ifElse";
import { fetchIfElseRealtimeToken } from "./actions";
import { useNodeStatus } from "@/features/executions/hooks/useNodeStatus";
import { NodeStatusIndicator } from "@/components/reactFlow/node-status-indicator";
import { WorkflowNode } from "@/components/reactFlow/workflowNode";
import { BaseNode, BaseNodeContent } from "@/components/reactFlow/base-node";
import { BaseHandle } from "@/components/reactFlow/base-handle";
import { useTheme } from "next-themes";
import { getThemedIcon } from "@/lib/icon";

type IfNodeData = {
    variableName?: string;
    condition?: string;
};

type IfNodeType = Node<IfNodeData>;

export const IfElseNode = memo((props: NodeProps<IfNodeType>) => {
    const { id, data } = props;
    const { setNodes, setEdges } = useReactFlow();
    const { resolvedTheme } = useTheme();
    const currentTheme = resolvedTheme === "dark" ? "dark" : "light"


    const [dialogOpen, setDialogOpen] = useState(false);

    const nodeStatus = useNodeStatus({
        nodeId: id,
        channel: IFELSE_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchIfElseRealtimeToken,
    });

    const description = data?.condition
        ? "Condition configured"
        : "Not configured";

    const handleDelete = () => {
        setNodes((nodes) => nodes.filter((n) => n.id !== id));
        setEdges((edges) =>
            edges.filter((e) => e.source !== id && e.target !== id)
        );
    };

    const handleSubmit = (values: IfElseFormValues) => {
        setNodes((nodes) =>
            nodes.map((n) =>
                n.id === id ? { ...n, data: { ...n.data, ...values } } : n
            )
        );
        setDialogOpen(false);
    };

    return (
        <>
            <WorkflowNode
                name="IF / ELSE"
                description={description}
                onDelete={handleDelete}
                onSetting={() => setDialogOpen(true)}
                showToolbar
            >
                <NodeStatusIndicator status={nodeStatus} variant="border">
                    <BaseNode
                        status={nodeStatus}
                        onDoubleClick={() => setDialogOpen(true)}
                    >
                        <BaseNodeContent className="relative">
                            {/* Icon */}
                            <Image
                                src={getThemedIcon("/utils/ifelse.svg", currentTheme)}
                                alt="If Else"
                                width={16}
                                height={16}
                            />

                            {/* INPUT */}
                            <BaseHandle
                                id="input"
                                type="target"
                                position={Position.Left}
                            />

                            {/* TRUE OUTPUT */}
                            <Handle
                                id="true"
                                type="source"
                                position={Position.Right}
                                style={{
                                    top: "40%",
                                    background: "#22c55e",
                                }}
                            />

                            {/* FALSE OUTPUT */}
                            <Handle
                                id="false"
                                type="source"
                                position={Position.Right}
                                style={{
                                    top: "60%",
                                    background: "#ef4444",
                                }}
                            />

                        </BaseNodeContent>
                    </BaseNode>
                </NodeStatusIndicator>
            </WorkflowNode>

            <IfElseDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={data}
            />
        </>
    );
});

IfElseNode.displayName = "IfElseNode";
