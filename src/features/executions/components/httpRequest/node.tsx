import type { Node, NodeProps } from "@xyflow/react";
import { memo } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { GlobeIcon } from "lucide-react";

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

    return (
        <>
            <BaseExecutionNode
                {...props}
                name={"HTTP Request"}
                icon={GlobeIcon}
                description={description}
                onDoubleClick={() => { }}
                onSetting={()=>{}}
            />
        </>
    )
});

HttpRequestNode.displayName = "HttpRequestNode"