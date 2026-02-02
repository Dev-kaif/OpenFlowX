import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { S3Dialog, S3FormValues } from "./dailog";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { fetchS3RealtimeToken } from "./actions";
import { S3_CHANNEL_NAME } from "@/inngest/channels/s3";

type S3NodeData = {
    variableName?: string;
    credentialId?: string;
    bucket?: string;
    key?: string;
    input?: string;
    acl?: "private" | "public-read";
};

type S3NodeType = Node<S3NodeData>;

export const S3Node = memo((props: NodeProps<S3NodeType>) => {
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
        channel: S3_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchS3RealtimeToken,
    });

    const handleSubmit = (values: S3FormValues) => {
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
                name="S3 Upload"
                icon="/aws.svg"
                description={description}
                status={nodeStatus}
                onDoubleClick={handleOpenSettings}
                onSetting={handleOpenSettings}
            />

            <S3Dialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
        </>
    );
});

S3Node.displayName = "S3Node";
