import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { PostgressDialog, PostgressFormValues } from "./dailog";
import { POSTGRESS_CHANNEL_NAME } from "@/inngest/channels/postgress";
import { useNodeStatus } from "@/features/executions/hooks/useNodeStatus";
import { BaseExecutionNode } from "../baseExecutionNode";
import { fetchPostgressRealtimeToken } from "./actions";

type PostgressNodeData = PostgressFormValues;

export const PostgressNode = memo((props: NodeProps<Node<PostgressNodeData>>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: POSTGRESS_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchPostgressRealtimeToken,
    });

    const handleSubmit = (values: PostgressFormValues) => {
        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === props.id ?
                    {
                        ...node,
                        data: { ...node.data, ...values }
                    }
                    : node
            )
        );
    };

    const actionText = props.data?.action || "Not Configured";
    const tableText = props.data?.tableName || "";

    return (
        <>
            <BaseExecutionNode
                {...props}
                name="Postgres"
                icon={"/postgress.svg"}
                description={`${actionText} ${tableText}`}
                status={nodeStatus}
                onDoubleClick={() => setDialogOpen(true)}
                onSetting={() => setDialogOpen(true)}
            />

            <PostgressDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={props.data}
            />
        </>
    );
});

PostgressNode.displayName = "PostgressNode";