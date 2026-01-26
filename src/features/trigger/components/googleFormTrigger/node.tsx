import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../baseTriggerNode";
import { GoogleFormTriggerDialog } from "./dailog";
import { useNodeStatus } from "@/features/executions/hooks/useNodeStatus";
import { GOOGLE_FORM_CHANNEL_NAME } from "@/inngest/channels/googleFormTrigger";
import { fetchGoogleFormTrigggerRealtimeToken } from "./actions";

export const GoogleFormTriggerNode = memo((props: NodeProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: GOOGLE_FORM_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchGoogleFormTrigggerRealtimeToken
    })

    const handleOpenSettings = () => {
        setDialogOpen(true);
    };

    return <>
        <BaseTriggerNode
            {...props}
            icon={"/googleform.svg"}
            name="Google Form"
            status={nodeStatus}
            onSetting={handleOpenSettings}
            onDoubleClick={handleOpenSettings}
        />
        <GoogleFormTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
});


GoogleFormTriggerNode.displayName = "GoogleFormTriggerNode";