import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { R2Dialog, R2FormValues } from "./dailog";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { fetchR2RealtimeToken } from "./actions";
import { R2_CHANNEL_NAME } from "@/inngest/channels/r2";

type R2NodeData = {
    variableName?: string;
    credentialId?: string;
    bucket?: string;
    key?: string;
    input?: string;
    acl?: "private" | "public-read";
};

type R2NodeType = Node<R2NodeData>;

export const R2Node = memo((props: NodeProps<R2NodeType>) => {
    const nodeData = props.data;

    const description = nodeData?.bucket
        ? `Upload to ${nodeData.bucket}`
        : "Not Configured";

    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const handleOpenSettings = () => {
        setDialogOpen(true);
    };

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: R2_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchR2RealtimeToken,
    });

    const handleSubmit = (values: R2FormValues) => {
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
                name="R2 Upload"
                icon="/cloudflare.svg"
                description={description}
                status={nodeStatus}
                onDoubleClick={handleOpenSettings}
                onSetting={handleOpenSettings}
            />

            <R2Dialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
        </>
    );
});

R2Node.displayName = "R2Node";
