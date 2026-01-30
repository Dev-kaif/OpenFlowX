import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { CodeDialog, CodeFormValues } from "./dailog";
import { fetchCodeRealtimeToken } from "./actions";
import { CODE_CHANNEL_NAME } from "@/inngest/channels/code";
import { useNodeStatus } from "@/features/executions/hooks/useNodeStatus";
import { BaseExecutionNode } from "../../baseExecutionNode";
import { Code } from "lucide-react";

type CodeNodeData = {
    code?: string;
};

type CodeNodeType = Node<CodeNodeData>;

export const CodeNode = memo((props: NodeProps<CodeNodeType>) => {
    const nodeData = props.data;

    // Dynamic description based on code presence
    const description = nodeData?.code
        ? "Code configured"
        : "Not Configured";

    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: CODE_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchCodeRealtimeToken,
    });

    const handleSubmit = (values: CodeFormValues) => {
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
                name="Code"
                icon={Code}
                description={description}
                status={nodeStatus}
                onDoubleClick={() => setDialogOpen(true)}
                onSetting={() => setDialogOpen(true)}
            />

            <CodeDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
        </>
    );
});

CodeNode.displayName = "CodeNode";