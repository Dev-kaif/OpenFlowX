import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { GrokFormValues, GrokDialog, AVAILABLE_MODELS } from "./dailog";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { fetchGrokRealtimeToken } from "./actions";
import { GROK_CHANNEL_NAME } from "@/inngest/channels/grok";

type GrokNodeData = {
    variableName?: string;
    model?: string;
    userPrompt?: string;
    systemPrompt?: string;
}

type GrokNodeType = Node<GrokNodeData>;

export const GrokNode = memo((props: NodeProps<GrokNodeType>) => {

    const nodeData = props.data;
    const description = nodeData?.userPrompt ? (nodeData.model || AVAILABLE_MODELS[0]).toUpperCase() : "Not Configured";

    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const handleOpenSettings = () => {
        setDialogOpen(true);
    };

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: GROK_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchGrokRealtimeToken
    });

    const handleSubmit = (values: GrokFormValues) => {
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
                name={"Grok"}
                icon={"/grok.svg"}
                description={description}
                status={nodeStatus}
                onDoubleClick={handleOpenSettings}
                onSetting={handleOpenSettings}
            />
            <GrokDialog
                onSubmit={handleSubmit}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                defaultValues={nodeData}
            />
        </>
    )
});

GrokNode.displayName = "GrokNode";
