import type { Node, NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { GlobeIcon } from "lucide-react";
import { HttpRequestDialog } from "./dailog";

type HttpRequestNodeData = {
    endpoint?: string;
    method?: "GET" | "PUT" | "POST" | "PATCH" | "DELETE";
    body?: string;
    [key: string]: unknown;
}

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo((props : NodeProps<HttpRequestNodeType>) => {

    const nodeData = props.data;
    const description = nodeData.endpoint ? `${nodeData.method || "GET"}` : "Not Configured";
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpenSettings = () => {
        setDialogOpen(true);
    };
    
    // const status ="loading"

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
            <HttpRequestDialog open={dialogOpen} onOpenChange={setDialogOpen} /> 
        </>
    )
});

HttpRequestNode.displayName = "HttpRequestNode"