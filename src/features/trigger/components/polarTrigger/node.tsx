import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../baseTriggerNode";
import { PolarTriggerDialog } from "./dailog";
import { useNodeStatus } from "@/features/executions/hooks/useNodeStatus";
import { fetchPolarTrigggerRealtimeToken } from "./actions";
import { POLAR_CHANNEL_NAME } from "@/inngest/channels/polarTrigger";

export const PolarTriggerNode = memo((props: NodeProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: POLAR_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchPolarTrigggerRealtimeToken
    })

    const handleOpenSettings = () => {
        setDialogOpen(true);
    };

    return <>
        <BaseTriggerNode
            {...props}
            icon={"/polar.svg"}
            name="Polar"
            description="Triggers on Polar events"
            status={nodeStatus}
            onSetting={handleOpenSettings}
            onDoubleClick={handleOpenSettings}
        />
        <PolarTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
});


PolarTriggerNode.displayName = "PolarTriggerNode";