import { memo, useState } from "react";
import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { BaseExecutionNode } from "../../baseExecutionNode";
import { JsonParseDialog, JsonParseFormValues } from "./dailog";
import { useNodeStatus } from "@/features/executions/hooks/useNodeStatus";
import { fetchJsonParseRealtimeToken } from "./actions";
import { JSON_PARSE_CHANNEL_NAME } from "@/inngest/channels/jsonParse";

type JsonParseNodeData = {
    input?: string;
    variableName?: string;
};

type JsonParseNodeType = Node<JsonParseNodeData>;

export const JsonParseNode = memo((props: NodeProps<JsonParseNodeType>) => {
    const nodeData = props.data;
    const [open, setOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const status = useNodeStatus({
        nodeId: props.id,
        channel: JSON_PARSE_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchJsonParseRealtimeToken,
    });

    const handleSubmit = (values: JsonParseFormValues) => {
        setNodes((nodes) =>
            nodes.map((n) =>
                n.id === props.id
                    ? { ...n, data: { ...n.data, ...values } }
                    : n
            )
        );
        setOpen(false);
    };

    return (
        <>
            <BaseExecutionNode
                {...props}
                name="JSON Parse"
                icon="/utils/json.svg"
                description={nodeData?.variableName ?? "Not Configured"}
                status={status}
                onDoubleClick={() => setOpen(true)}
                onSetting={() => setOpen(true)}
            />

            <JsonParseDialog
                open={open}
                onOpenChange={setOpen}
                onSubmit={handleSubmit}
                defaultValues={nodeData}
            />
        </>
    );
});

JsonParseNode.displayName = "JsonParseNode";
