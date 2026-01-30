import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { DelayDialog, DelayFormValues } from "./dailog";
import { fetchDelayRealtimeToken } from "./actions";
import { DELAY_CHANNEL_NAME } from "@/inngest/channels/delay";
import { useNodeStatus } from "@/features/executions/hooks/useNodeStatus";
import { BaseExecutionNode } from "../../baseExecutionNode";

type DelayNodeData = {
    seconds?: number;
};

type DelayNodeType = Node<DelayNodeData>;

export const DelayNode = memo((props: NodeProps<DelayNodeType>) => {
    const nodeData = props.data;
    const description = nodeData?.seconds
        ? `Wait ${nodeData.seconds}s`
        : "Not Configured";

    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: DELAY_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchDelayRealtimeToken,
    });

    const handleSubmit = (values: DelayFormValues) => {
        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === props.id
                    ? { ...node, data: { ...node.data, ...values } }
                    : node
            )
        );
        setDialogOpen(false);
    };

    return (
        <>
            <BaseExecutionNode
                {...props}
                name="Delay"
                icon="/utils/delay.svg"
                description={description}
                status={nodeStatus}
                onDoubleClick={() => setDialogOpen(true)}
                onSetting={() => setDialogOpen(true)}
            />

            <DelayDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
        </>
    );
});

DelayNode.displayName = "DelayNode";
