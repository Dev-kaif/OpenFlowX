import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { ScraperDialog, ScraperFormValues } from "./dailog";
import { fetchScraperRealtimeToken } from "./actions";
import { SCRAPER_CHANNEL_NAME } from "@/inngest/channels/scraper";
import { useNodeStatus } from "@/features/executions/hooks/useNodeStatus";
import { BaseExecutionNode } from "../../baseExecutionNode";
import { Eye } from "lucide-react";

type ScraperNodeData = ScraperFormValues;

export const ScraperNode = memo((props: NodeProps<Node<ScraperNodeData>>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: SCRAPER_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchScraperRealtimeToken,
    });

    const handleSubmit = (values: ScraperFormValues) => {
        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === props.id ? { ...node, data: { ...node.data, ...values } } : node
            )
        );
    };

    const preview = props.data?.url
        ? props.data.url.substring(0, 30) + (props.data.url.length > 30 ? "..." : "")
        : "Not Configured";

    return (
        <>
            <BaseExecutionNode
                {...props}
                name="Web Scraper"
                icon={Eye}
                description={preview}
                status={nodeStatus}
                onDoubleClick={() => setDialogOpen(true)}
                onSetting={() => setDialogOpen(true)}
            />

            <ScraperDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={props.data}
            />
        </>
    );
});

ScraperNode.displayName = "ScraperNode";