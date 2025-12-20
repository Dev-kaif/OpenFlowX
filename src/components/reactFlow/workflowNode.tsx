import { NodeToolbar, Position } from "@xyflow/react";
import { ReactNode } from "react";
import { Button } from "../ui/button";
import { SettingsIcon, TrashIcon } from "lucide-react";



interface workflowNodePros {
    children: ReactNode;
    showToolbar?: boolean;
    name?: string;
    description?: string;
    onSetting?: () => void;
    onDelete?: () => void;
}

export const WorkflowNode = ({
    children,
    showToolbar,
    name,
    description,
    onSetting,
    onDelete
}: workflowNodePros) => {
    return (
        <>
            {showToolbar && (
                <NodeToolbar>
                    <Button size={"sm"} variant={"ghost"} onClick={onSetting}>
                        <SettingsIcon className="size-4" />
                    </Button>
                    <Button size={"sm"} variant={"ghost"} onClick={onDelete}>
                        <TrashIcon className="size-4" />
                    </Button>
                </NodeToolbar>
            )}
            {children}
            {!!name && (
                <NodeToolbar
                    position={Position.Bottom}
                    isVisible
                    className="max-w-[200px] text-center"
                >
                    <p className="font-medium">
                        {name}
                    </p>
                    {!!description && (
                        <p className="text-muted-foreground trunacte text-sm">
                            {description}
                        </p>
                    )}
                </NodeToolbar>
            )}
        </>
    );
};