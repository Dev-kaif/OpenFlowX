import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { ScheduleDialog, ScheduleFormValues } from "./dailog";
import { fetchScheduleRealtimeToken } from "./actions";
import { SCHEDULE_CHANNEL_NAME } from "@/inngest/channels/schedule";
import { useNodeStatus } from "@/features/executions/hooks/useNodeStatus";
import { useDeleteSchedule } from "./hook";
import { BaseTriggerNode } from "../baseTriggerNode";

type ScheduleNodeData = {
    mode?: "interval" | "daily" | "weekly";
    intervalMinutes?: number;
    time?: string;
    days?: number[];
    timezone?: string;
    enabled?: boolean;
    workflowId: string;
};

type ScheduleNodeType = Node<ScheduleNodeData>;

export const ScheduleNode = memo((props: NodeProps<ScheduleNodeType>) => {
    const nodeData = props.data;
    const deleteSchedule = useDeleteSchedule();

    const description = (() => {
        if (!nodeData?.mode) return "Not Configured";

        if (nodeData.mode === "interval") {
            return `Every ${nodeData.intervalMinutes} min`;
        }

        if (nodeData.mode === "daily") {
            return `Daily at ${nodeData.time}`;
        }

        if (nodeData.mode === "weekly") {
            return `Weekly at ${nodeData.time}`;
        }

        return "Not Configured";
    })();

    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: SCHEDULE_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchScheduleRealtimeToken,
    });

    const handleSubmit = (values: ScheduleFormValues) => {
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

    const handleDelete = () => {
        deleteSchedule.mutate({
            nodeId: props.id
        });
    };

    return (
        <>
            <BaseTriggerNode
                {...props}
                name="Schedule"
                icon="/utils/schedule.svg"
                description={description}
                status={nodeStatus}
                onDoubleClick={() => setDialogOpen(true)}
                onSetting={() => setDialogOpen(true)}
                onDelete={handleDelete}
            />

            <ScheduleDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
                nodeId={props.id}
            />
        </>
    );
});

ScheduleNode.displayName = "ScheduleNode";
