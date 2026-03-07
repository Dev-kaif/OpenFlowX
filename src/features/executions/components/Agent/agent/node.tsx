import { Position, useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { Bot } from "lucide-react";
import { WorkflowNode } from "@/components/reactFlow/workflowNode";
import { BaseNode, BaseNodeContent } from "@/components/reactFlow/base-node";
import { BaseHandle } from "@/components/reactFlow/base-handle";
import { NodeStatusIndicator } from "@/components/reactFlow/node-status-indicator";
import { AgentDialog, AgentFormValues } from "./dailog";
import { useNodeStatus } from "@/features/executions/hooks/useNodeStatus";
import { AGENT_CHANNEL_NAME } from "@/inngest/channels/agent";
import { fetchAgentRealtimeToken } from "./actions";

type AgentNodeData = {
    prompt?: string;
    credentialId?: string;
    variableName?: string;
    model?: string;
    provider?: string;
    maxSteps?: number;
};

type AgentNodeType = Node<AgentNodeData>;

export const AgentNode = memo((props: NodeProps<AgentNodeType>) => {
    const { id, data } = props;

    const description = data?.prompt
        ? (data.model ?? "No model").toUpperCase()
        : "Not Configured";

    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes, setEdges } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: id,
        channel: AGENT_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchAgentRealtimeToken,
    });

    const handleDelete = () => {
        setNodes((nodes) => nodes.filter((n) => n.id !== id));
        setEdges((edges) =>
            edges.filter((e) => e.source !== id && e.target !== id)
        );
    };

    const handleSubmit = (values: AgentFormValues) => {
        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === id
                    ? {
                        ...node,
                        data: {
                            ...node.data,
                            variableName: values.variableName,
                            provider: values.provider,
                            model: values.model,
                            credentialId: values.credentialId,
                            prompt: values.prompt,
                        },
                    }
                    : node
            )
        );
        setDialogOpen(false);
    };

    return (
        <>
            <WorkflowNode
                name="AI Agent"
                description={description}
                showToolbar
                onSetting={() => setDialogOpen(true)}
                onDelete={handleDelete}
            >
                <NodeStatusIndicator status={nodeStatus} variant="border">
                    <BaseNode status={nodeStatus} onDoubleClick={() => setDialogOpen(true)}>
                        <BaseNodeContent>
                            <Bot className="size-4 text-dark dark:text-white" />
                            <BaseHandle
                                id="target-1"
                                type="target"
                                position={Position.Left}
                            />
                            <BaseHandle
                                id="tools"
                                type="target"
                                position={Position.Bottom}
                                className="bg-purple-500!"
                            />
                            <BaseHandle
                                id="source-1"
                                type="source"
                                position={Position.Right}
                            />
                        </BaseNodeContent>
                    </BaseNode>
                </NodeStatusIndicator>
            </WorkflowNode>

            <AgentDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={{
                    variableName: data.variableName,
                    provider: data.provider,
                    model: data.model,
                    credentialId: data.credentialId,
                    prompt: data.prompt,
                }}
            />
        </>
    );
});

AgentNode.displayName = "AgentNode";