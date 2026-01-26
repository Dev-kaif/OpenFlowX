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
}

export const StripeTriggerDialog = ({ open, onOpenChange }: Props) => {
    const params = useParams();
    const workflowId = params.workflowID as string;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookUrl = `${baseUrl}/api/webhooks/stripe?workflowId=${workflowId}`;

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
                    <DialogTitle>Stripe Trigger Configuration</DialogTitle>
                    <DialogDescription>
                        Configure this webhook URL in your Stripe Dashboard to trigger this
                        workflow on payment events.
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

                    {/* Instructions */}
                    <div className="rounded-lg bg-muted p-3 text-xs">
                        <ol className="space-y-1 list-decimal list-inside text-muted-foreground">
                            <li>Open your Stripe Dashboard</li>
                            <li>Go to Developers → Webhooks</li>
                            <li>Click "Add endpoint"</li>
                            <li>Paste the webhook URL above</li>
                            <li>
                                Select events to listen for (e.g.{" "}
                                <code className="bg-background px-1 py-0.5 rounded">
                                    payment_intent.succeeded
                                </code>
                                )
                            </li>
                            <li>Save and copy the signing secret</li>
                        </ol>
                    </div>

                    {/* Available Variables */}
                    <div className="rounded-lg bg-muted p-3 space-y-2">
                        <h4 className="text-sm font-medium">Available Variables</h4>

                        <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-xs text-muted-foreground">
                            <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                {"{{stripe.amount}}"}
                            </code>
                            <span>Payment amount</span>

                            <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                {"{{stripe.currency}}"}
                            </code>
                            <span>Currency code</span>

                            <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                {"{{stripe.customerId}}"}
                            </code>
                            <span>Customer ID</span>

                            <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                {"{{stripe.eventType}}"}
                            </code>
                            <span>Event type (e.g. payment_intent.succeeded)</span>

                            <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                {"{{json stripe}}"}
                            </code>
                            <span>Full Stripe event payload as JSON</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
