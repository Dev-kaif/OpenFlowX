import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { OpenRouterFormValues, OpenRouterDialog, AVAILABLE_MODELS } from "./dailog";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { fetchOpenRouterRealtimeToken } from "./actions";
import { OPENROUTER_CHANNEL_NAME } from "@/inngest/channels/openrouter";

type OpenRouterNodeData = {
    variableName?: string;
    model?: string;
    userPrompt?: string;
    systemPrompt?: string;
}

type OpenRouterNodeType = Node<OpenRouterNodeData>;

export const OpenRouterNode = memo((props: NodeProps<OpenRouterNodeType>) => {

    const nodeData = props.data;
    const description = nodeData?.userPrompt ? (nodeData.model || AVAILABLE_MODELS[0]).toUpperCase() : "Not Configured";

    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const handleOpenSettings = () => {
        setDialogOpen(true);
    };

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: OPENROUTER_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchOpenRouterRealtimeToken
    });

    const handleSubmit = (values: OpenRouterFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        ...values
                    },
                };
            }
            return node;
        }));
        setDialogOpen(false);
    };


    return (
        <>
            <BaseExecutionNode
                {...props}
                name={"Open Router"}
                icon={"/openrouter.svg"}
                description={description}
                status={nodeStatus}
                onDoubleClick={handleOpenSettings}
                onSetting={handleOpenSettings}
            />
            <OpenRouterDialog
                onSubmit={handleSubmit}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                defaultValues={nodeData}
            />
        </>
    )
});

OpenRouterNode.displayName = "OpenRouterNode";