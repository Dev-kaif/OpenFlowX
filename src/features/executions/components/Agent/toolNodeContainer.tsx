import { NodeToolbar, Position } from "@xyflow/react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SettingsIcon, TrashIcon } from "lucide-react";

interface ToolNodeProps {
    children: ReactNode;
    showToolbar?: boolean;

    name?: string;
    description?: string;

    onSettings?: () => void;
    onDelete?: () => void;
}

export const ToolNodeContainer = ({
    children,
    showToolbar,
    name,
    description,
    onSettings,
    onDelete,
}: ToolNodeProps) => {
    return (
        <>
            {showToolbar && (
                <NodeToolbar position={Position.Right}
                    className="flex flex-col"
                >
                    {/* SETTINGS ONLY IF EXISTS */}
                    {onSettings && (
                        <Button size="sm" variant="ghost" onClick={onSettings}>
                            <SettingsIcon className="size-4" />
                        </Button>
                    )}

                    <Button size="sm" variant="ghost" onClick={onDelete}>
                        <TrashIcon className="size-4" />
                    </Button>
                </NodeToolbar>
            )}

            {children}

            {!!name && (
                <NodeToolbar
                    position={Position.Bottom}
                    isVisible
                    className="text-center"
                >
                    <p className="font-medium">{name}</p>

                    {!!description && (
                        <p className="text-muted-foreground truncate text-sm">
                            {description}
                        </p>
                    )}
                </NodeToolbar>
            )}
        </>
    );
};