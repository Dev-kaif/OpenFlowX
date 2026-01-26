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
import { CopyIcon, ChevronDown } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { generateGoogleFormScript } from "./utils";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const GoogleFormTriggerDialog = ({ open, onOpenChange }: Props) => {
    const params = useParams();
    const workflowId = params.workflowID as string;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookUrl = `${baseUrl}/api/webhooks/google-form?workflowId=${workflowId}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(webhookUrl);
            toast.success("Webhook URL copied");
        } catch {
            toast.error("Failed to copy URL");
        }
    };

    const handleCopyScript = async () => {
        const script = generateGoogleFormScript(webhookUrl);
        try {
            await navigator.clipboard.writeText(script);
            toast.success("Script copied");
        } catch {
            toast.error("Failed to copy script");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Google Form Trigger</DialogTitle>
                    <DialogDescription>
                        Use this webhook URL in Google Form Apps Script to trigger this workflow.
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
                            <Button type="button" size="icon" variant="outline" onClick={copyToClipboard}>
                                <CopyIcon className="size-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="rounded-lg bg-muted p-3 text-xs">
                        <ol className="space-y-1 list-decimal list-inside text-muted-foreground">
                            <li>Open your Google Form</li>
                            <li>Click the three dots → Script editor</li>
                            <li>Paste the script</li>
                            <li>Save → Triggers → Add Trigger</li>
                            <li>Choose: From form → On form submit</li>
                        </ol>
                    </div>

                    {/* Script */}
                    <details className="rounded-lg bg-muted p-3">
                        <summary className="cursor-pointer text-sm font-medium">
                            Google Apps Script
                        </summary>

                        <div className="mt-3 space-y-2">
                            <Button type="button" variant="outline" onClick={handleCopyScript}>
                                <CopyIcon className="size-4 mr-2" />
                                Copy Script
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                This script already includes your webhook URL.
                            </p>
                        </div>
                    </details>

                    {/* Variables */}
                    <details className="rounded-lg bg-muted p-3">
                        <summary className="cursor-pointer text-sm font-medium">
                            Available Variables
                        </summary>

                        <div className="mt-3 space-y-2 text-xs">
                            <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2 text-muted-foreground">
                                <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                    {"{{googleForm.respondentEmail}}"}
                                </code>
                                <span>Respondent email</span>

                                <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                    {"{{googleForm.responses.some_field}}"}
                                </code>
                                <span>Specific answer (example)</span>

                                <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                    {"{{googleForm.responses}}"}
                                </code>
                                <span>All responses object</span>
                            </div>

                            <p className="text-muted-foreground">
                                Field names are auto-generated from questions. Example:{" "}
                                <code className="bg-background px-1 py-0.5 rounded">what_is_url</code>
                            </p>
                        </div>
                    </details>
                </div>
            </DialogContent>
        </Dialog>
    );
};
