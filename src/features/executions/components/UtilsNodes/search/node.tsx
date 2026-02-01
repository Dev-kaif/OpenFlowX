import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { SearchDialog, SearchFormValues } from "./dailog";
import { fetchSearchRealtimeToken } from "./actions";
import { SEARCH_CHANNEL_NAME } from "@/inngest/channels/search";
import { useNodeStatus } from "@/features/executions/hooks/useNodeStatus";
import { BaseExecutionNode } from "../../baseExecutionNode";
import { Search } from "lucide-react";

type SearchNodeData = SearchFormValues;

export const SearchNode = memo((props: NodeProps<Node<SearchNodeData>>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: SEARCH_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchSearchRealtimeToken,
    });

    const handleSubmit = (values: SearchFormValues) => {
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
    };

    const preview = props.data?.query
        ? props.data.query.substring(0, 30) + (props.data.query.length > 30 ? "..." : "")
        : "Not Configured";

    return (
        <>
            <BaseExecutionNode
                {...props}
                name="Search"
                icon={Search}
                description={preview}
                status={nodeStatus}
                onDoubleClick={() => setDialogOpen(true)}
                onSetting={() => setDialogOpen(true)}
            />

            <SearchDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={props.data}
            />
        </>
    );
});

SearchNode.displayName = "SearchNode";