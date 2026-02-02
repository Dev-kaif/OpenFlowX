"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type TelegramConnectData = {
    botUsername: string;
    url: string;
    command: string;
    expiresAt?: string;
};

interface TelegramConnectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data?: TelegramConnectData;
    isLoading?: boolean;
}

export function TelegramConnectDialog({
    open,
    onOpenChange,
    data,
    isLoading,
}: TelegramConnectDialogProps) {
    const handleCopy = async () => {
        if (!data?.command) return;
        await navigator.clipboard.writeText(data.command);
        toast.success("Command copied to clipboard");
    };

    const handleOpenTelegram = () => {
        if (!data?.url) return;
        window.open(data.url, "_blank");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Connect Telegram</DialogTitle>
                    <DialogDescription>
                        Link your Telegram account to receive messages from workflows.
                    </DialogDescription>
                </DialogHeader>

                {/* AUTO CONNECT */}
                <div className="space-y-2">
                    <Button
                        className="w-full"
                        onClick={handleOpenTelegram}
                        disabled={isLoading || !data}
                    >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Telegram Bot
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                        If Telegram doesn’t auto-connect, use the manual method below.
                    </p>
                </div>

                <Separator />

                {/* MANUAL CONNECT */}
                <div className="space-y-3">
                    <div className="text-sm font-medium">
                        Manual connection (always works)
                    </div>

                    <div className="rounded-lg border bg-muted p-3 flex items-center justify-between gap-3">
                        <code className="text-xs font-mono break-all">
                            {data?.command ?? "/connect XXXXX"}
                        </code>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCopy}
                            disabled={!data}
                        >
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        1. Open Telegram and search for{" "}
                        <span className="font-medium">@{data?.botUsername}</span>
                        <br />
                        2. Paste and send the command above
                    </p>

                    {data?.expiresAt && (
                        <p className="text-[11px] text-muted-foreground">
                            This code expires at{" "}
                            {new Date(data.expiresAt).toLocaleTimeString()}
                        </p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
