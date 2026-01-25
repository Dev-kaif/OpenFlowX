import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { GlobeIcon } from "lucide-react";
import { HttpRequestFormValues, HttpRequestDialog } from "./dailog";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { HTTP_CHANNEL_NAME } from "@/inngest/channels/httpRequest";
import { fetchHttpRequestRealtimeToken } from "./actions";

type HttpRequestNodeData = {
    variableName?: string
    endpoint?: string;
    method?: "GET" | "PUT" | "POST" | "PATCH" | "DELETE";
    body?: string;
}

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo((props: NodeProps<HttpRequestNodeType>) => {

    const nodeData = props.data;
    const nodeEndpoint = nodeData.endpoint ? nodeData.endpoint.replace(/^https:\/\//, "").replace(/\/$/, "") : "";
    const description = nodeData.endpoint ? `${nodeData.method || "GET"}  ${nodeEndpoint}` : "Not Configured";
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const handleOpenSettings = () => {
        setDialogOpen(true);
    };

    const nodeStatus = useNodeStatus({
        nodeId: props.id,
        channel: HTTP_CHANNEL_NAME,
        topic: "status",
        refreshToken: fetchHttpRequestRealtimeToken
    })

    const handleSubmit = (values: HttpRequestFormValues) => {
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
                name={"HTTP Request"}
                icon={GlobeIcon}
                description={description}
                status={nodeStatus}
                onDoubleClick={handleOpenSettings}
                onSetting={handleOpenSettings}
            />
            <HttpRequestDialog
                onSubmit={handleSubmit}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                defaultValues={nodeData}
            />
        </>
    )
});

HttpRequestNode.displayName = "HttpRequestNode"