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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCredentialsByType } from "@/features/credentails/hooks/useCredentials";
import { CredentialType } from "@/generated/prisma/enums";
import Image from "next/image";


const s3Schema = z.object({
    variableName: z
        .string()
        .min(1, "Variable name is required")
        .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, {
            message: "Must start with a letter or underscore",
        }),

    credentialId: z.string().min(1, "S3 credential is required"),

    bucket: z.string().min(1, "Bucket name is required"),

    key: z.string().min(1, "Object key is required"),

    input: z.string().min(1, "File input is required"),

    acl: z.enum(["private", "public-read"]).optional(),
});

export type S3FormValues = z.infer<typeof s3Schema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: S3FormValues) => void;
    defaultValues?: Partial<S3FormValues>;
}

/* =======================
   Component
======================= */

export const S3Dialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {
    const { data: credentials, isLoading } =
        useCredentialsByType(CredentialType.S3);

    const form = useForm<S3FormValues>({
        resolver: zodResolver(s3Schema),
        defaultValues: {
            variableName: defaultValues.variableName ?? "uploadedFile",
            bucket: defaultValues.bucket ?? "",
            key: defaultValues.key ?? "{{file.name}}",
            input: defaultValues.input ?? "{{file}}",
            acl: defaultValues.acl ?? "private",
            credentialId: defaultValues.credentialId ?? "",
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName ?? "uploadedFile",
                bucket: defaultValues.bucket ?? "",
                key: defaultValues.key ?? "{{file.name}}",
                input: defaultValues.input ?? "{{file}}",
                acl: defaultValues.acl ?? "private",
                credentialId: defaultValues.credentialId ?? "",
            });
        }
    }, [open, form, defaultValues]);

    const watchVar = form.watch("variableName") || "uploadedFile";

    const handleSubmit = (values: S3FormValues) => {
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>S3 Upload</DialogTitle>
                    <DialogDescription>
                        Upload a file to S3 / R2-compatible storage
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
                                    <FormLabel>Output Variable</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Use in next nodes:
                                        <code className="ml-2 font-mono">
                                            {`{{${watchVar}.url}}`}
                                        </code>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Credentials */}
                        <FormField
                            control={form.control}
                            name="credentialId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>S3 Credential</FormLabel>

                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={isLoading || !credentials?.length}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={
                                                        credentials?.length
                                                            ? "Select credential"
                                                            : "No S3 credentials added"
                                                    }
                                                />
                                            </SelectTrigger>
                                        </FormControl>

                                        <SelectContent>
                                            {credentials?.map((cred) => (
                                                <SelectItem key={cred.id} value={cred.id}>
                                                    <div className="flex items-center gap-2">
                                                        <Image
                                                            src="/aws.svg"
                                                            alt="S3"
                                                            width={16}
                                                            height={16}
                                                        />
                                                        {cred.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <FormDescription>
                                        Add an <b>S3 credential</b> in Credentials using JSON:
                                        <pre className="mt-2 rounded bg-muted p-2 text-xs font-mono overflow-x-auto">
                                            {`{
  "accessKeyId": "AKIA...",
  "secretAccessKey": "********",
  "region": "us-east-1",
  "endpoint": "https://s3.amazonaws.com"
}`}
                                        </pre>
                                    </FormDescription>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        {/* Bucket */}
                        <FormField
                            control={form.control}
                            name="bucket"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bucket</FormLabel>
                                    <FormControl>
                                        <Input placeholder="my-bucket" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Key */}
                        <FormField
                            control={form.control}
                            name="key"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Object Key</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="uploads/{{file.name}}"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Supports variables and paths
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Input */}
                        <FormField
                            control={form.control}
                            name="input"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>File Input</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="font-mono text-xs min-h-[90px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Accepts:
                                        <ul className="list-disc pl-5 mt-1 text-xs">
                                            <li><code>{`{{file}}`}</code> (File node)</li>
                                            <li>Base64 data URL</li>
                                            <li>Public file URL</li>
                                        </ul>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ACL */}
                        <FormField
                            control={form.control}
                            name="acl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Access</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="private">Private</SelectItem>
                                            <SelectItem value="public-read">
                                                Public Read
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        {/* Helper */}
                        <div className="rounded-lg bg-muted p-4 text-xs space-y-2">
                            <h4 className="font-medium">What this outputs</h4>
                            <pre className="bg-background p-2 rounded text-[11px] overflow-x-auto">
                                {`{
    url: string,
    bucket: string,
    key: string,
    mime: string,
    size: number
}`}
                            </pre>
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
