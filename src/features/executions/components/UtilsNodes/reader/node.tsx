import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { DocumentReaderFormValues, DocumentReaderDialog } from "./dailog";
import { fetchDocumentReaderRealtimeToken } from "./actions";
import { BaseExecutionNode } from "../../baseExecutionNode";
import { useNodeStatus } from "@/features/executions/hooks/useNodeStatus";
import { DOCUMENT_READER_CHANNEL_NAME } from "@/inngest/channels/reader";

type DocumentReaderNodeData = {
    variableName?: string;
    fileUrl?: string;
}

type DocumentReaderNodeType = Node<DocumentReaderNodeData>;

export const DocumentReaderNode = memo((props: NodeProps<DocumentReaderNodeType>) => {

    const nodeData = props.data;
    // Show the variable name if configured, otherwise show status
    const description = nodeData?.fileUrl
        ? (nodeData.variableName || "Ready to Parse")
        : "Not Configured";

    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const handleOpenSettings = () => {
        setDialogOpen(true);
    };

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: DOCUMENT_READER_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchDocumentReaderRealtimeToken
    });

    const handleSubmit = (values: DocumentReaderFormValues) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        ...values
                    },
                };
            }
            return node;
        }));
        setDialogOpen(false);
    };

    return (
        <>
            <BaseExecutionNode
                {...props}
                name={"Document Reader"}
                icon={"/utils/document.svg"}
                description={description}
                status={nodeStatus}
                onDoubleClick={handleOpenSettings}
                onSetting={handleOpenSettings}
            />
            <DocumentReaderDialog
                onSubmit={handleSubmit}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                defaultValues={nodeData}
            />
        </>
    )
});

DocumentReaderNode.displayName = "DocumentReaderNode";