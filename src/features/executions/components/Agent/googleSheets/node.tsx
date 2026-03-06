import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseToolNode } from "../BaseToolNode";
import { GoogleSheetsToolDialog } from "./dailog";

type GoogleSheetsNodeData = {
    credentialId?: string;
    spreadsheetId?: string;
    range?: string;
    values?: string;
};

type GoogleSheetsNodeType = Node<GoogleSheetsNodeData>;

export const GoogleSheetsToolNode = memo(
    (props: NodeProps<GoogleSheetsNodeType>) => {
        const nodeData = props.data;

        const [dialogOpen, setDialogOpen] = useState(false);
        const { setNodes } = useReactFlow();

        const handleOpenSettings = () => {
            setDialogOpen(true);
        };

        const handleSubmit = (values: {
            credentialId: string;
            spreadsheetId: string;
            range: string;
            values?: string;
        }) => {
            setNodes((nodes) =>
                nodes.map((node) => {
                    if (node.id === props.id) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                ...values,
                            },
                        };
                    }
                    return node;
                })
            );

            setDialogOpen(false);
        };

        const description = nodeData?.spreadsheetId
            ? `Range: ${nodeData.range}`
            : "Not configured";

        return (
            <>
                <BaseToolNode
                    {...props}
                    name="Google Sheets"
                    icon="/sheets.svg"
                    description={description}
                    onDoubleClick={handleOpenSettings}
                    onSetting={handleOpenSettings}
                />

                <GoogleSheetsToolDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    onSubmit={handleSubmit}
                    defaultValues={nodeData}
                />
            </>
        );
    }
);

GoogleSheetsToolNode.displayName = "GoogleSheetsToolNode";