import { memo } from "react";
import { Node, NodeProps } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { BaseToolNode } from "../../BaseToolNode";

type HttpRequestNodeData = {
    endpoint?: string;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestToolNode = memo(
    (props: NodeProps<HttpRequestNodeType>) => {
        return (
            <BaseToolNode
                {...props}
                name="HTTP Request"
                description="Call external APIs"
                icon={GlobeIcon}
            />
        );
    }
);

HttpRequestToolNode.displayName = "HttpRequestToolNode";