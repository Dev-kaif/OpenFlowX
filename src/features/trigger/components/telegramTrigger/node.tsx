import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";

import { BaseTriggerNode } from "../baseTriggerNode";
import { TelegramTriggerDialog, TelegramTriggerFormValues } from "./dailog";
import { useNodeStatus } from "@/features/executions/hooks/useNodeStatus";

import { TELEGRAM_TRIGGER_CHANNEL } from "@/inngest/channels/telegramTrigger";
import { fetchTelegramTrigggerRealtimeToken } from "./actions";


type TelegramTriggerNodeData = {
    command?: string;
};

type TelegramTriggerNodeType = Node<TelegramTriggerNodeData>;


export const TelegramTriggerNode = memo(
    (props: NodeProps<TelegramTriggerNodeType>) => {
        const nodeData = props.data;

        const description = nodeData?.command
            ? `Command: ${nodeData.command}`
            : "Any incoming Telegram message";

        const [dialogOpen, setDialogOpen] = useState(false);
        const { setNodes } = useReactFlow();

        const nodeStatus = useNodeStatus({
            nodeId: props.id,
            channel: TELEGRAM_TRIGGER_CHANNEL,
            topic: "status",
            refreshToken: fetchTelegramTrigggerRealtimeToken,
        });

        const handleOpenSettings = () => {
            setDialogOpen(true);
        };

        const handleSubmit = (values: TelegramTriggerFormValues) => {
            setNodes((nodes) =>
                nodes.map((node) => {
                    if (node.id === props.id) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                command: values.command?.trim() || "",
                            },
                        };
                    }
                    return node;
                })
            );

            setDialogOpen(false);
        };

        return (
            <>
                <BaseTriggerNode
                    {...props}
                    icon="/telegram.svg"
                    name="Telegram Trigger"
                    description={description}
                    status={nodeStatus}
                    onSetting={handleOpenSettings}
                    onDoubleClick={handleOpenSettings}
                />

                <TelegramTriggerDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    onSubmit={handleSubmit}
                    defaultValues={nodeData}
                />
            </>
        );
    }
);

TelegramTriggerNode.displayName = "TelegramTriggerNode";
