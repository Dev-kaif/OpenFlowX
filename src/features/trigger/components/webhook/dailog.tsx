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
            <DialogContent className="max-h-[85vh] max-w-sm overflow-x-hidden overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Webhook Trigger Configuration</DialogTitle>
                    <DialogDescription>
                        Use this webhook URL to trigger the workflow from any
                        external service, script, or application.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">

                    {/* Webhook URL */}
                    <div className="space-y-2">
                        <Label htmlFor="webhook-url">Webhook URL</Label>

                        <div className="flex gap-2">
                            <Input
                                id="webhook-url"
                                value={webhookUrl}
                                readOnly
                                className="font-mono text-xs break-all"
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

                    {/* Instructions */}
                    <div className="rounded-lg bg-muted p-3 text-xs">
                        <ol className="space-y-1 list-decimal list-inside text-muted-foreground">
                            <li>Copy the webhook URL above</li>
                            <li>Send an HTTP request to that URL</li>
                            <li>The request payload becomes available inside the workflow</li>
                            <li>You can reference the data using template variables</li>
                        </ol>
                    </div>

                    {/* Example Request */}
                    <div className="rounded-lg bg-muted p-3 text-xs space-y-2">
                        <p className="font-medium">Example Request</p>

                        <code className="block bg-background p-2 rounded font-mono text-xs overflow-x-auto">
                            {`curl -X POST "${webhookUrl}" \\
-H "Content-Type: application/json" \\
-d '{"message":"Hello OpenFlowX"}'`}
                        </code>
                    </div>

                    {/* Available Variables */}
                    <div className="rounded-lg bg-muted p-3 space-y-3">
                        <h4 className="text-sm font-medium">
                            Available Variables
                        </h4>

                        <div className="grid sm:grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-xs text-muted-foreground">

                            <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                {"{{webhook.body.message}}"}
                            </code>
                            <span>Access a specific field from request body</span>

                            <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                {"{{json webhook.body}}"}
                            </code>
                            <span>Get the full body as formatted JSON</span>

                            <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                {"{{webhook.headers.authorization}}"}
                            </code>
                            <span>Access request headers</span>

                            <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                {"{{webhook.query.userId}}"}
                            </code>
                            <span>Access query parameters</span>

                            <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                {"{{json webhook}}"}
                            </code>
                            <span>Full webhook payload</span>

                        </div>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
};