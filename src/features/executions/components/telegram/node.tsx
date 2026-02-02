import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { TelegramDialog, TelegramFormValues } from "./dailog";
import { useNodeStatus } from "@/features/executions/hooks/useNodeStatus";
import { fetchTelegramRealtimeToken } from "./actions";
import { TELEGRAM_CHANNEL_NAME } from "@/inngest/channels/telegram";

type TelegramNodeData = {
    variableName?: string;
    message?: string;
};

type TelegramNodeType = Node<TelegramNodeData>;

export const TelegramNode = memo((props: NodeProps<TelegramNodeType>) => {
    const nodeData = props.data;

    const description = nodeData?.message
        ? nodeData.message.slice(0, 40)
        : "Not Configured";

    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: TELEGRAM_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchTelegramRealtimeToken,
    });

    const handleSubmit = (values: TelegramFormValues) => {
        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === props.id
                    ? {
                        ...node,
                        data: {
                            ...node.data,
                            ...values,
                        },
                    }
                    : node
            )
        );
        setDialogOpen(false);
    };

    return (
        <>
            <BaseExecutionNode
                {...props}
                name="Telegram"
                icon="/telegram.svg"
                description={description}
                status={nodeStatus}
                onDoubleClick={() => setDialogOpen(true)}
                onSetting={() => setDialogOpen(true)}
            />

            <TelegramDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
        </>
    );
});

TelegramNode.displayName = "TelegramNode";
