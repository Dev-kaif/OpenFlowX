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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import { FileText, Loader2 } from "lucide-react";

/* ================= SCHEMA ================= */

export const templateFormSchema = z.object({
    variableName: z
        .string()
        .min(1, "Variable name is required")
        .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "Invalid variable name (letters, numbers, underscores only)"),
    template: z.string().min(1, "Template content is required"),
});

export type TemplateFormValues = z.infer<typeof templateFormSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: TemplateFormValues) => void;
    defaultValues?: Partial<TemplateFormValues>;
}

export const TemplateDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues,
}: Props) => {
    const form = useForm<TemplateFormValues>({
        resolver: zodResolver(templateFormSchema),
        defaultValues: {
            variableName: defaultValues?.variableName ?? "text",
            template:
                defaultValues?.template ??
                "Hello {{trigger.name}},\n\nHere is your summary:\n{{gemini.result}}",
        },
    });

    const watchVariableName = form.watch("variableName") || "text";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-orange-500" />
                        Text Template
                    </DialogTitle>
                    <DialogDescription>
                        Compose text, emails, or AI prompts using data from previous steps.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit((v) => {
                            onSubmit(v);
                            onOpenChange(false);
                        })}
                        className="space-y-4"
                    >
                        {/* Variable Name */}
                        <FormField
                            control={form.control}
                            name="variableName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Variable Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="email_body" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="rounded-lg bg-muted p-3 text-xs space-y-2">
                            <p className="font-medium">Available variables in next node</p>
                            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-muted-foreground">
                                <code className="bg-background px-1.5 py-0.5 rounded">
                                    {`{{${watchVariableName}.text}}`}
                                </code>
                                <span>The final rendered text</span>
                                <code className="bg-background px-1.5 py-0.5 rounded">
                                    {`{{${watchVariableName}.raw}}`}
                                </code>
                                <span>The raw objext</span>
                            </div>
                        </div>

                        {/* Editor */}
                        <FormField
                            control={form.control}
                            name="template"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center justify-between">
                                        Template Content
                                        <span className="text-xs text-muted-foreground font-normal">
                                            Use <code className="bg-muted px-1 rounded">{`{{ variable }}`}</code> to insert data
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="border rounded-md overflow-hidden h-[300px] w-full bg-[#1e1e1e]">
                                            <Editor
                                                height="100%"
                                                defaultLanguage="handlebars"
                                                theme="vs-dark"
                                                value={field.value}
                                                onChange={(value) => field.onChange(value || "")}
                                                loading={
                                                    <div className="h-full w-full flex items-center justify-center text-muted-foreground gap-2">
                                                        <Loader2 className="animate-spin h-5 w-5" />
                                                        Loading Editor...
                                                    </div>
                                                }
                                                options={{
                                                    minimap: { enabled: false },
                                                    fontSize: 14,
                                                    lineNumbers: "off",
                                                    scrollBeyondLastLine: false,
                                                    automaticLayout: true,
                                                    padding: { top: 16 },
                                                    wordWrap: "on",
                                                }}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save Template</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};