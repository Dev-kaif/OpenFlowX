import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { SearchToolDialog, SearchFormValues } from "./dailog";
import { Search } from "lucide-react";
import { BaseToolNode } from "../../BaseToolNode";

type SearchNodeData = SearchFormValues;

export const SearchToolNode = memo((props: NodeProps<Node<SearchNodeData>>) => {

    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();


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


    return (
        <>
            <BaseToolNode
                {...props}
                name="Search"
                icon={Search}
                onDoubleClick={() => setDialogOpen(true)}
                onSetting={() => setDialogOpen(true)}
            />

            <SearchToolDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultValues={props.data}
            />
        </>
    );
});

SearchToolNode.displayName = "SearchToolNode";