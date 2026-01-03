import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../baseTriggerNode";
import { MousePointerIcon } from "lucide-react";
import { ManualTriggerDialog } from "./dailog";

export const ManualTriggerNode = memo((props: NodeProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    // const nodeStatus = "loading";

    const handleOpenSettings = () => {
        setDialogOpen(true);
    };
    
    return <>
        <BaseTriggerNode
            {...props}
            icon={MousePointerIcon}
            name="When clicking executes workflow"
            // status={nodeStatus}
            onSetting={handleOpenSettings}
            onDoubleClick={handleOpenSettings}
        />
        <ManualTriggerDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
});


ManualTriggerNode.displayName = "ManualTriggerNode";