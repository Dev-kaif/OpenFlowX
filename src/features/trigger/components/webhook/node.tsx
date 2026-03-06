import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../baseTriggerNode";
import { WebhookIcon } from "lucide-react";
import { WebhookTriggerDialog } from "./dailog";
import { useNodeStatus } from "@/features/executions/hooks/useNodeStatus";
import { WEBHOOK_TRIGGER_CHANNEL } from "@/inngest/channels/webhook";
import { fetchWebhookTriggerRealtimeToken } from "./actions";

export const WebhookTriggerNode = memo((props: NodeProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: WEBHOOK_TRIGGER_CHANNEL,
        topic: "status",
        refreshToken: fetchWebhookTriggerRealtimeToken
    });

    const handleOpenSettings = () => {
        setDialogOpen(true);
    };

    return (
        <>
            <BaseTriggerNode
                {...props}
                icon={WebhookIcon}
                name="Webhook Trigger"
                description="Trigger workflow when an HTTP request hits this endpoint"
                status={nodeStatus}
                onSetting={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />

            <WebhookTriggerDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                nodeId={props.id}
            />
        </>
    );
});

WebhookTriggerNode.displayName = "WebhookTriggerNode";