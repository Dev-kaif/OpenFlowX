import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { ResendDialog, ResendFormValues } from "./dailog";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { RESEND_CHANNEL_NAME } from "@/inngest/channels/resend";
import { fetchResendRealtimeToken } from "./actions";


type ResendNodeData = {
    credentialId?: string;
    to?: string;
    subject?: string;
    html?: string;
    from?: string;
    variableName?: string;
};

type ResendNodeType = Node<ResendNodeData>;

export const ResendNode = memo((props: NodeProps<ResendNodeType>) => {
    const nodeData = props.data;

    const description =
        nodeData?.to && nodeData?.subject
            ? `Email → ${nodeData.to}`
            : "Not Configured";

    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const handleOpenSettings = () => {
        setDialogOpen(true);
    };

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: RESEND_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchResendRealtimeToken,
    });

    const handleSubmit = (values: ResendFormValues) => {
        setNodes((nodes) =>
            nodes.map((node) => {
                if (node.id === props.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            ...values,
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
            <BaseExecutionNode
                {...props}
                name="Resend"
                icon="/resend.svg"
                description={description}
                status={nodeStatus}
                onDoubleClick={handleOpenSettings}
                onSetting={handleOpenSettings}
            />

            <ResendDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
        </>
    );
});

ResendNode.displayName = "ResendNode";
