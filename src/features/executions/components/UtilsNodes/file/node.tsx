import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { FileDialog, FileFormValues } from "./dailog";
import { fetchFileRealtimeToken } from "./actions";
import { FILE_CHANNEL_NAME } from "@/inngest/channels/file";
import { useNodeStatus } from "@/features/executions/hooks/useNodeStatus";
import { BaseExecutionNode } from "../../baseExecutionNode";
import { FileIcon } from "lucide-react";

type FileNodeData = {
    variableName?: string;
    input?: string;
    filename?: string;
};

type FileNodeType = Node<FileNodeData>;

export const FileNode = memo((props: NodeProps<FileNodeType>) => {
    const nodeData = props.data;

    const description = nodeData?.input
        ? nodeData.filename
            ? `File: ${nodeData.filename}`
            : "File prepared"
        : "Not Configured";

    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: FILE_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchFileRealtimeToken,
    });

    const handleSubmit = (values: FileFormValues) => {
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

    return (
        <>
            <BaseExecutionNode
                {...props}
                name="File Transform"
                icon={FileIcon}
                description={description}
                status={nodeStatus}
                onDoubleClick={() => setDialogOpen(true)}
                onSetting={() => setDialogOpen(true)}
            />

            <FileDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
        </>
    );
});

FileNode.displayName = "FileNode";
