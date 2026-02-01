import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../baseExecutionNode";
import { GoogleSheetsDialog } from "./dailog";
import { useNodeStatus } from "../../hooks/useNodeStatus";
import { fetchGoogleSheetsRealtimeToken } from "./actions";
import { GOOGLE_SHEETS_CHANNEL_NAME } from "@/inngest/channels/googleSheets";

type GoogleSheetsNodeData = {
    variableName?: string;
    credentialId?: string;
    action?: "append" | "read";
    spreadsheetId?: string;
    range?: string;
    values?: string;
};

type GoogleSheetsNodeType = Node<GoogleSheetsNodeData>;

export const GoogleSheetsNode = memo(
    (props: NodeProps<GoogleSheetsNodeType>) => {
        const nodeData = props.data;

        const description = nodeData?.spreadsheetId
            ? `${nodeData.action === "read" ? "READ" : "APPEND"} → ${nodeData.range ?? "Sheet"
            }`
            : "Not Configured";

        const [dialogOpen, setDialogOpen] = useState(false);
        const { setNodes } = useReactFlow();

        const handleOpenSettings = () => {
            setDialogOpen(true);
        };

        const nodeStatus = useNodeStatus({
            nodeId: props.id,
            channel: GOOGLE_SHEETS_CHANNEL_NAME,
            topic: "status",
            refreshToken: fetchGoogleSheetsRealtimeToken,
        });

        const handleSubmit = (values: {
            credentialId: string;
            variableName: string;
            action: "append" | "read";
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

        return (
            <>
                <BaseExecutionNode
                    {...props}
                    name="Google Sheets"
                    icon="/sheets.svg"
                    description={description}
                    status={nodeStatus}
                    onDoubleClick={handleOpenSettings}
                    onSetting={handleOpenSettings}
                />

                <GoogleSheetsDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    onSubmit={handleSubmit}
                    defaultValues={nodeData}
                />
            </>
        );
    }
);

GoogleSheetsNode.displayName = "GoogleSheetsNode";
