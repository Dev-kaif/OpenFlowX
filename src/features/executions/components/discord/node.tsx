import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { DiscordFormValues, DiscordDialog } from "./dailog";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { fetchDiscordRealtimeToken } from "./actions";
import { DISCORD_CHANNEL_NAME } from "@/inngest/channels/discord";

type DiscordNodeData = {
    webhookUrl?: string;
    content?: string;
    username?: string;
}

type DiscordNodeType = Node<DiscordNodeData>;

export const DiscordNode = memo((props: NodeProps<DiscordNodeType>) => {

    const nodeData = props.data;
    const description = nodeData?.content ? `Send: ${nodeData.content.slice(0, 50)}...` : "Not Configured"

    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const handleOpenSettings = () => {
        setDialogOpen(true);
    };

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: DISCORD_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchDiscordRealtimeToken
    })

    const handleSubmit = (values: DiscordFormValues) => {
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
                name={"Discord"}
                icon={"/discord.svg"}
                description={description}
                status={nodeStatus}
                onDoubleClick={handleOpenSettings}
                onSetting={handleOpenSettings}
            />
            <DiscordDialog
                onSubmit={handleSubmit}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                defaultValues={nodeData}
            />
        </>
    )
});

DiscordNode.displayName = "DiscordNode";