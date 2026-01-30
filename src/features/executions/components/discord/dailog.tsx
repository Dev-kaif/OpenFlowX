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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";


const formSchema = z.object({
    variableName: z
        .string()
        .min(1, { message: "Variable name is required" })
        .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, {
            message:
                "Must start with a letter or underscore and contain only letters, numbers, underscores",
        }),

    webhookUrl: z
        .string()
        .url("Must be a valid Discord webhook URL")
        .min(1, { message: "Webhook URL is required" }),

    username: z.string().optional(),

    content: z
        .string()
        .min(1, "Message content is required")
        .max(2000, "Discord messages cannot exceed 2000 characters"),
});

export type DiscordFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: DiscordFormValues) => void;
    defaultValues?: Partial<DiscordFormValues>;
}


export const DiscordDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {
    const form = useForm<DiscordFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "myDiscord",
            webhookUrl: defaultValues.webhookUrl || "",
            username: defaultValues.username || "",
            content: defaultValues.content || "",
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "myDiscord",
                webhookUrl: defaultValues.webhookUrl || "",
                username: defaultValues.username || "",
                content: defaultValues.content || "",
            });
        }
    }, [open, form, defaultValues]);

    const watchVariableName = form.watch("variableName") || "myDiscord";

    const handleSubmit = (values: DiscordFormValues) => {
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Discord</DialogTitle>
                    <DialogDescription>
                        Send a message to a Discord channel using a webhook.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-5 mt-4"
                    >
                        {/* Variable Name */}
                        <FormField
                            control={form.control}
                            name="variableName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Variable Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="myDiscord" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Output reference for later nodes:
                                        <code className="ml-2 font-mono">
                                            {`{{${watchVariableName}.status}}`}
                                        </code>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Webhook URL */}
                        <FormField
                            control={form.control}
                            name="webhookUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Webhook URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://discord.com/api/webhooks/..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Create one in Discord → Channel Settings → Integrations →
                                        Webhooks
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Username */}
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username (optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Bot name override" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Overrides the webhook’s default username.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Content */}
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message Content</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Build finished successfully!"
                                            className="min-h-[120px] font-mono text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        <div className="rounded-lg bg-muted p-3 space-y-3 text-xs">
                                            <h4 className="font-medium text-sm">Using Variables</h4>

                                            <div className="space-y-2 text-muted-foreground">
                                                <p>You can inject data from previous nodes:</p>

                                                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
                                                    <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                                        {`{{${watchVariableName}.text}}`}

                                                    </code>
                                                    <span>Insert generated text</span>

                                                    <code className="bg-background px-1.5 py-0.5 rounded text-foreground">
                                                        {`{{json ${watchVariableName}.raw}}`}
                                                    </code>
                                                    <span>Inject full object as JSON</span>
                                                </div>
                                            </div>
                                        </div>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
