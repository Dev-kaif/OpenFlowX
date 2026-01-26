import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../baseTriggerNode";
import { StripeTriggerDialog } from "./dailog";
import { useNodeStatus } from "@/features/executions/hooks/useNodeStatus";
import { fetchStripeTrigggerRealtimeToken } from "./actions";
import { STRIPE_CHANNEL_NAME } from "@/inngest/channels/stripeTrigger";

export const StripeTriggerNode = memo((props: NodeProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: STRIPE_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchStripeTrigggerRealtimeToken
    })

    const handleOpenSettings = () => {
        setDialogOpen(true);
    };

    return <>
        <BaseTriggerNode
            {...props}
            icon={"/stripe.svg"}
            name="Stripe"
            description="Triggers on Stripe events"
            status={nodeStatus}
            onSetting={handleOpenSettings}
            onDoubleClick={handleOpenSettings}
        />
        <StripeTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
});


StripeTriggerNode.displayName = "StripeTriggerNode";