import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { GlobeIcon } from "lucide-react";
import { HttpRequestFormValues, HttpRequestDialog } from "./dailog";

type HttpRequestNodeData = {
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

    // const status ="loading"

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
                // status={status}
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