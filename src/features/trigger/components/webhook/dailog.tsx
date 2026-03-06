"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    nodeId: string;
}

export const WebhookTriggerDialog = ({ open, onOpenChange, nodeId }: Props) => {

    const params = useParams();
    const workflowId = params.workflowID as string;

    const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const webhookUrl = `${baseUrl}/api/webhooks/trigger/${nodeId}?workflowId=${workflowId}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(webhookUrl);
            toast.success("Webhook URL copied");
        } catch {
            toast.error("Failed to copy URL");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Webhook Trigger Configuration</DialogTitle>
                    <DialogDescription>
                        Send an HTTP request to this URL to trigger the workflow.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">

                    {/* Webhook URL */}
                    <div className="space-y-2">
                        <Label htmlFor="webhook-url">Webhook URL</Label>

                        <div className="flex gap-2">
                            <Input
                                id="webhook-url"
                                value={webhookUrl}
                                readOnly
                                className="font-mono text-xs"
                            />

                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={copyToClipboard}
                            >
                                <CopyIcon className="size-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Example Request */}
                    <div className="rounded-lg bg-muted p-3 text-xs">
                        <p className="font-medium mb-2">Example Request</p>

                        <code className="block bg-background p-2 rounded font-mono text-xs">
                            {`curl -X POST ${webhookUrl} \\
-H "Content-Type: application/json" \\
-d '{"message":"Hello OpenFlowX"}'`}
                        </code>
                    </div>

                    {/* Available Variables */}
                    <div className="rounded-lg bg-muted p-3 space-y-2">

                        <h4 className="text-sm font-medium">
                            Available Variables
                        </h4>

                        <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-xs text-muted-foreground">

                            <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                {"{{webhook.body}}"}
                            </code>
                            <span>Request body</span>

                            <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                {"{{webhook.headers}}"}
                            </code>
                            <span>Request headers</span>

                            <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                {"{{webhook.query}}"}
                            </code>
                            <span>Query parameters</span>

                            <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                {"{{json webhook.body}}"}
                            </code>
                            <span>Full body as JSON</span>

                            <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                {"{{json webhook}}"}
                            </code>
                            <span>Complete webhook payload</span>

                        </div>

                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
};