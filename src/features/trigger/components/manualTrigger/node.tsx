import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../baseTriggerNode";
import { MousePointerIcon } from "lucide-react";
import { ManualTriggerDialog } from "./dailog";
import { useNodeStatus } from "@/features/executions/hooks/useNodeStatus";
import { MANUAL_TRIGGER_CHANNEL } from "@/inngest/channels/manualTrigger";
import { fetchManualTrigggerRealtimeToken } from "./actions";

export const ManualTriggerNode = memo((props: NodeProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: MANUAL_TRIGGER_CHANNEL,
        topic: "status",
        refreshToken: fetchManualTrigggerRealtimeToken
    })


    const handleOpenSettings = () => {
        setDialogOpen(true);
    };

    return <>
        <BaseTriggerNode
            {...props}
            icon={MousePointerIcon}
            name="When clicking executes workflow"
            status={nodeStatus}
            onSetting={handleOpenSettings}
            onDoubleClick={handleOpenSettings}
        />
        <ManualTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
});


ManualTriggerNode.displayName = "ManualTriggerNode";