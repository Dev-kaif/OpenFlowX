import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { OpenAIFormValues, OpenAIDialog, AVAILABLE_MODELS } from "./dailog";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { fetchOpenAIRealtimeToken } from "./actions";
import { OPENAI_CHANNEL_NAME } from "@/inngest/channels/openAi";

type OpenAINodeData = {
    variableName?: string;
    model?: string;
    userPrompt?: string;
    systemPrompt?: string;
}

type OpenAINodeType = Node<OpenAINodeData>;

export const OpenAINode = memo((props: NodeProps<OpenAINodeType>) => {

    const nodeData = props.data;
    const description = nodeData?.userPrompt ? (nodeData.model || AVAILABLE_MODELS[0]).toUpperCase() : "Not Configured";

    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const handleOpenSettings = () => {
        setDialogOpen(true);
    };

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: OPENAI_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchOpenAIRealtimeToken
    });

    const handleSubmit = (values: OpenAIFormValues) => {
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
                name={"Open AI"}
                icon={"/openai.svg"}
                description={description}
                status={nodeStatus}
                onDoubleClick={handleOpenSettings}
                onSetting={handleOpenSettings}
            />
            <OpenAIDialog
                onSubmit={handleSubmit}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                defaultValues={nodeData}
            />
        </>
    )
});

OpenAINode.displayName = "OpenAINode";