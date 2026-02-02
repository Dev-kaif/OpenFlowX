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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";

/* =======================
   Schema
======================= */

export const fileFormSchema = z.object({
    variableName: z.string().min(1, "Variable name is required"),
    input: z.string().min(1, "File input is required"),
    filename: z.string().optional(),
});

export type FileFormValues = z.infer<typeof fileFormSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: FileFormValues) => void;
    defaultValues?: Partial<FileFormValues>;
}


export const FileDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues,
}: Props) => {
    const form = useForm<FileFormValues>({
        resolver: zodResolver(fileFormSchema),
        defaultValues: {
            variableName: defaultValues?.variableName ?? "file",
            input: defaultValues?.input ?? "{{ai.text}}",
            filename: defaultValues?.filename ?? "",
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>File</DialogTitle>
                    <DialogDescription>
                        Convert input into a reusable file object
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
                        {/* Output Variable */}
                        <FormField
                            control={form.control}
                            name="variableName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Output Variable</FormLabel>
                                    <FormControl>
                                        <Input placeholder="file" {...field} />
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground">
                                        Use this in next nodes (e.g. <code>{`{{file.url}}`}</code>)
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* File Input */}
                        <FormField
                            control={form.control}
                            name="input"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>File Input</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="font-mono text-xs h-32"
                                            placeholder="{{ai.text}}"
                                            {...field}
                                        />
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground">
                                        Can be a URL, base64 string, or JSON
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Optional Filename */}
                        <FormField
                            control={form.control}
                            name="filename"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Filename (optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="report.pdf" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Helper Card */}
                        <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                            <h4 className="font-medium">What this does</h4>
                            <ul className="list-disc pl-5 text-muted-foreground">
                                <li>Normalizes input into a File object</li>
                                <li>Supports URLs, base64, and JSON</li>
                                <li>Use before S3, R2, or Cloudinary</li>
                            </ul>
                        </div>

                        <DialogFooter>
                            <DialogClose>Cancel</DialogClose>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
