import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { DeepSeekFormValues, DeepSeekDialog, AVAILABLE_MODELS } from "./dailog";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { fetchDeepseekRealtimeToken } from "./actions";
import { OPENAI_CHANNEL_NAME } from "@/inngest/channels/openAi";
import { DEEPSEEK_CHANNEL_NAME } from "@/inngest/channels/deepseek";

type DeepseekNodeData = {
    variableName?: string;
    model?: string;
    userPrompt?: string;
    systemPrompt?: string;
}

type DeepseekNodeType = Node<DeepseekNodeData>;

export const DeepseekNode = memo((props: NodeProps<DeepseekNodeType>) => {

    const nodeData = props.data;
    const description = nodeData?.userPrompt ? (nodeData.model || AVAILABLE_MODELS[0]).toUpperCase() : "Not Configured";

    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const handleOpenSettings = () => {
        setDialogOpen(true);
    };

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: DEEPSEEK_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchDeepseekRealtimeToken
    });

    const handleSubmit = (values: DeepSeekFormValues) => {
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
                name={"Deepseek"}
                icon={"/deepseek.svg"}
                description={description}
                status={nodeStatus}
                onDoubleClick={handleOpenSettings}
                onSetting={handleOpenSettings}
            />
            <DeepSeekDialog
                onSubmit={handleSubmit}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                defaultValues={nodeData}
            />
        </>
    )
});

DeepseekNode.displayName = "DeepseekNode";