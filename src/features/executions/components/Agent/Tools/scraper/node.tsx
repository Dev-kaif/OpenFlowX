import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { ScraperDialog, ScraperFormValues } from "./dailog";
import { Eye } from "lucide-react";
import { BaseToolNode } from "../../BaseToolNode";

type ScraperToolNodeData = ScraperFormValues;

export const ScraperToolNode = memo((props: NodeProps<Node<ScraperToolNodeData>>) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();


    const handleSubmit = (values: ScraperFormValues) => {
        setNodes((nodes) =>
            nodes.map((node) =>
                node.id === props.id ? { ...node, data: { ...node.data, ...values } } : node
            )
        );
    };

    return (
        <>
            <BaseToolNode
                {...props}
                name="Web Scraper"
                icon={Eye}
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

ScraperToolNode.displayName = "ScraperToolNode";