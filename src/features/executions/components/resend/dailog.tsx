"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useCredentialsByType } from "@/features/credentails/hooks/useCredentials";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


export const resendSchema = z.object({
    credentialId: z.string().min(1, "API Key is required"),
    variableName: z.string().min(1, "Required"),
    to: z.string().min(1, "Recipient is required"),
    from: z.string().optional(),
    subject: z.string().min(1, "Subject is required"),
    html: z.string().min(1, "Email body is required"),
});

export type ResendFormValues = z.infer<typeof resendSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: ResendFormValues) => void;
    defaultValues?: Partial<ResendFormValues>;
}

export const ResendDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues,
}: Props) => {
    const { data: credentials, isLoading } = useCredentialsByType("RESEND");

    const form = useForm<ResendFormValues>({
        resolver: zodResolver(resendSchema),
        defaultValues: {
            credentialId: defaultValues?.credentialId ?? "",
            variableName: defaultValues?.variableName ?? "email_result",
            to: defaultValues?.to ?? "",
            from: defaultValues?.from ?? "onboarding@resend.dev",
            subject: defaultValues?.subject ?? "Report:",
            html:
                defaultValues?.html ??
                `<p>Hi there,</p>
<p>Here is the summary you requested:</p>
<blockquote>{{ai_response.text}}</blockquote>
<p>Best,<br/>Your AI Agent</p>\n`,
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Resend Email</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit((v) => {
                            onSubmit(v);
                            onOpenChange(false);
                        })}
                        className="space-y-4"
                    >
                        {/* Variable + Credential */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="variableName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Output Variable</FormLabel>
                                        <FormControl>
                                            <Input placeholder="email_status" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="credentialId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Resend API Key</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            disabled={isLoading || !credentials?.length}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={
                                                            isLoading
                                                                ? "Loading credentials..."
                                                                : credentials?.length
                                                                    ? "Select credential"
                                                                    : "No API keys available"
                                                        }
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {credentials?.map((cred) => (
                                                    <SelectItem key={cred.id} value={cred.id}>
                                                        {cred.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* To / From */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="to"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>To</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="user@example.com or {{email}}"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="from"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>From</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="My App <me@myapp.com>"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Subject */}
                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Daily Update" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* HTML Editor */}
                        <FormField
                            control={form.control}
                            name="html"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Body (HTML)</FormLabel>
                                    <FormControl>
                                        <div className="border rounded-md overflow-hidden">
                                            <Editor
                                                height="260px"
                                                language="html"
                                                theme="vs-dark"
                                                value={field.value}
                                                onChange={(value) =>
                                                    field.onChange(value ?? "")
                                                }
                                                options={{
                                                    minimap: { enabled: false },
                                                    fontSize: 12,
                                                    wordWrap: "on",
                                                    scrollBeyondLastLine: false,
                                                }}
                                            />
                                        </div>
                                    </FormControl>
                                    <p className="text-[10px] text-muted-foreground">
                                        Supports <b>HTML</b> and Handlebars variables like{" "}
                                        <code>{`{{user.email}}`}</code>
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" className="gap-2">
                                <Send className="w-4 h-4" />
                                Save Email Node
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
