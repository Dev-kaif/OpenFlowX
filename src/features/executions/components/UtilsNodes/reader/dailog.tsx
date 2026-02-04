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

    fileUrl: z.string().min(1, { message: "File URL is required" }),
});

export type DocumentReaderFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: DocumentReaderFormValues) => void;
    defaultValues?: Partial<DocumentReaderFormValues>;
}

export const DocumentReaderDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {
    const form = useForm<DocumentReaderFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "myDoc",
            fileUrl: defaultValues.fileUrl || "",
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "myDoc",
                fileUrl: defaultValues.fileUrl || "",
            });
        }
    }, [open, form, defaultValues]);

    const watchVariableName = form.watch("variableName") || "myDoc";

    const handleSubmit = (values: DocumentReaderFormValues) => {
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Document Reader</DialogTitle>
                    <DialogDescription>
                        Extract text from files (PDF, DOCX, CSV) via URL.
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
                                        <Input placeholder="myDoc" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Use this in next nodes like:{" "}
                                        <code className="font-mono">
                                            {`{{${watchVariableName}.text}}`}
                                        </code>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* File URL */}
                        <FormField
                            control={form.control}
                            name="fileUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>File URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="https://example.com/invoice.pdf"
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormDescription>
                                        <div className="rounded-lg bg-muted p-3 space-y-3 text-xs">
                                            <h4 className="font-medium text-sm">Supported Link Types</h4>

                                            <ul className="space-y-2 text-muted-foreground list-disc pl-4">
                                                <li>
                                                    <span className="font-medium text-foreground">Direct Downloads:</span>
                                                    {" "}URLs ending in .pdf, .docx, .csv
                                                </li>
                                                <li>
                                                    <span className="font-medium text-foreground">Google Drive:</span>
                                                    {" "}Standard "Share" links (auto-converted to download)
                                                </li>
                                                <li>
                                                    <span className="font-medium text-foreground">Dropbox:</span>
                                                    {" "}Share links
                                                </li>
                                                <li>
                                                    <span className="font-medium text-foreground">Cloud Storage:</span>
                                                    {" "}AWS S3, Cloudflare R2, Supabase Storage (Public or Presigned URLs)
                                                </li>
                                            </ul>

                                            <p className="pt-1 text-muted-foreground border-t border-border/50">
                                                <strong>Note:</strong> Files must be publicly accessible or use a presigned URL. Max size: 20MB.
                                            </p>
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