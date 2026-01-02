import { NodeProps } from "@xyflow/react";
import { memo } from "react";
import { BaseTriggerNode } from "../baseTriggerNode";
import { MousePointerIcon } from "lucide-react";

export const ManualTriggerNode = memo((props: NodeProps) => {
    return <>
        <BaseTriggerNode
            {...props}
            icon={MousePointerIcon}
            name="When clicking executes workflow"
            // start={nodeStatus}
            // onSetting={handleOpenSetting}
            // onDoubleClick={handleOpenSetting}
        />
    </>
});


ManualTriggerNode.displayName = "ManualTriggerNode";