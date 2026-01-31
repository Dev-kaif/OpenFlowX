import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { TemplateDialog, TemplateFormValues } from "./dailog";
import { fetchTemplateRealtimeToken } from "./actions";
import { TEMPLATE_CHANNEL_NAME } from "@/inngest/channels/template";
import { useNodeStatus } from "@/features/executions/hooks/useNodeStatus";
import { BaseExecutionNode } from "../../baseExecutionNode";
import { FileText } from "lucide-react";

type TemplateNodeData = TemplateFormValues;

export const TemplateNode = memo((props: NodeProps<Node<TemplateNodeData>>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: TEMPLATE_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchTemplateRealtimeToken,
    });

    const handleSubmit = (values: TemplateFormValues) => {
        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === props.id ?
                    {
                        ...node,
                        data: {
                            ...node.data,
                            ...values
                        }
                    } : node
            )
        );
    };

    const preview = props.data?.template
        ? props.data.template.substring(0, 30) + (props.data.template.length > 30 ? "..." : "")
        : "Not Configured";

    return (
        <>
            <BaseExecutionNode
                {...props}
                name="Template"
                icon={FileText}
                description={preview}
                status={nodeStatus}
                onDoubleClick={() => setDialogOpen(true)}
                onSetting={() => setDialogOpen(true)}
            />

            <TemplateDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={props.data}
            />
        </>
    );
});

TemplateNode.displayName = "TemplateNode";