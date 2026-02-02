"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { ExternalLinkIcon, InfoIcon } from "lucide-react";
import Link from "next/link";


const formSchema = z.object({
    command: z
        .string()
        .min(1, "Command is required")
        .refine((v) => v.startsWith("/"), {
            message: "Command must start with /",
        }),
});

export type TelegramTriggerFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: TelegramTriggerFormValues) => void;
    defaultValues?: Partial<TelegramTriggerFormValues>;
}


export const TelegramTriggerDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {
    const form = useForm<TelegramTriggerFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            command: defaultValues.command || "/deploy",
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                command: defaultValues.command || "/deploy",
            });
        }
    }, [open, form, defaultValues]);

    const handleSubmit = (values: TelegramTriggerFormValues) => {
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Telegram Trigger</DialogTitle>
                    <DialogDescription>
                        Trigger this workflow when your Telegram bot receives a command
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-5 mt-4"
                    >
                        {/* Command */}
                        <FormField
                            control={form.control}
                            name="command"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Trigger Command</FormLabel>
                                    <FormControl>
                                        <Input placeholder="/deploy" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The workflow will trigger only when this exact command is
                                        sent to the bot.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Payload preview */}
                        <div>
                            <div className="rounded-lg bg-muted p-3 space-y-2 text-xs">
                                <p className="font-medium text-sm">Using this trigger output</p>

                                <div className="space-y-1 text-muted-foreground">
                                    <p>You can reference the incoming Telegram message in next nodes:</p>

                                    <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                                        <code className="bg-background px-1.5 py-0.5 rounded font-mono text-foreground">
                                            {`{{telegram.text}}`}
                                        </code>
                                        <span>Message text</span>

                                        <code className="bg-background px-1.5 py-0.5 rounded font-mono text-foreground">
                                            {`{{telegram.from.username}}`}
                                        </code>
                                        <span>Sender username</span>

                                        <code className="bg-background px-1.5 py-0.5 rounded font-mono text-foreground">
                                            {`{{telegram.chat.id}}`}
                                        </code>
                                        <span>Chat ID</span>

                                        <code className="bg-background px-1.5 py-0.5 rounded font-mono text-foreground">
                                            {`{{json telegram.raw}}`}
                                        </code>
                                        <span>Full Telegram update payload</span>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Info box */}
                        <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
                            <div className="flex items-start gap-2">
                                <InfoIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <div className="space-y-1">
                                    <p className="font-medium">
                                        Telegram not connected yet?
                                    </p>
                                    <p className="text-muted-foreground">
                                        Go to <b>Settings → Integrations</b> and connect your Telegram
                                        bot before using this trigger.
                                    </p>

                                    <Link
                                        href="/settings/#integration"
                                        className="inline-flex items-center gap-1 text-primary hover:underline"
                                    >
                                        Open Integrations
                                        <ExternalLinkIcon className="h-3 w-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="mt-4">
                            <DialogClose className="mr-2">Cancel</DialogClose>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
