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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Globe, Key, AlertCircle, PlusCircle } from "lucide-react";
import { useCredentialsByType } from "@/features/credentails/hooks/useCredentials";
import { CredentialType } from "@/generated/prisma/enums";
import Link from "next/link";

export const searchSchema = z.object({
    variableName: z
        .string()
        .min(1, "Variable name is required")
        .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "Invalid variable name"),
    query: z.string().min(1, "Search query is required"),
    credentialId: z.string().optional(),
});

export type SearchFormValues = z.infer<typeof searchSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: SearchFormValues) => void;
    defaultValues?: Partial<SearchFormValues>;
}

export const SearchDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues,
}: Props) => {
    const { data: credentials, isLoading: isLoadingCredentials } =
        useCredentialsByType(CredentialType.TAVILY);

    const form = useForm<SearchFormValues>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            variableName: defaultValues?.variableName ?? "search",
            query: defaultValues?.query ?? "",
            credentialId: defaultValues?.credentialId ?? "system", // Use "system" as the internal key for empty/default
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues?.variableName ?? "search",
                query: defaultValues?.query ?? "",
                credentialId: defaultValues?.credentialId || "system",
            });
        }
    }, [open, form, defaultValues]);

    const watchVariableName = form.watch("variableName") || "search";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Globe className="w-5 h-5 text-blue-500" />
                        Google Search
                    </DialogTitle>
                    <DialogDescription>
                        Search the live web using Tavily AI Search.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit((v) => {
                            // Map "system" back to undefined/empty string for the backend
                            const payload = {
                                ...v,
                                credentialId: v.credentialId === "system" ? "" : v.credentialId
                            };
                            onSubmit(payload);
                            onOpenChange(false);
                        })}
                        className="space-y-5 mt-4"
                    >
                        <FormField
                            control={form.control}
                            name="variableName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Variable Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="search_results" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Access via: <code className="text-xs">{`{{${watchVariableName}.results}}`}</code>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="query"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Search Query</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g. Current stock price of Nvidia"
                                            className="h-24 resize-none font-mono text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="credentialId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Key className="w-3.5 h-3.5" />
                                        Custom API Key (Optional)
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Use system default" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="system">Use system default</SelectItem>
                                            {credentials?.map((cred) => (
                                                <SelectItem key={cred.id} value={cred.id}>
                                                    {cred.name}
                                                </SelectItem>
                                            ))}

                                            {/* Empty State Action */}
                                            {(!credentials || credentials.length === 0) && !isLoadingCredentials && (
                                                <div className="p-2 text-center">
                                                    <p className="text-[10px] text-muted-foreground mb-2">No custom keys found</p>
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>

                                    <div className="flex gap-2 mt-2 p-2.5 rounded-md bg-amber-50 border border-amber-100 text-[11px] text-amber-800">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <p>
                                            <b>Note:</b> We provide free searches, but if you encounter failures or 403 errors, you can add your own <b>Tavily API Key</b> in the Credentials tab and select it here.
                                        </p>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Updated Helper Reference */}
                        <div className="rounded-lg bg-muted p-3 text-[11px] space-y-2">
                            <p className="font-semibold text-muted-foreground uppercase tracking-wider">Data mapping</p>
                            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
                                {/* Full Text Summary */}
                                <code className="bg-background border px-1.5 py-0.5 rounded text-blue-600 font-medium">
                                    {`{{${watchVariableName}.text}}`}
                                </code>
                                <span className="text-muted-foreground">Full summary (Best for AI nodes)</span>

                                {/* Top Result Title */}
                                <code className="bg-background border px-1.5 py-0.5 rounded text-foreground">
                                    {`{{${watchVariableName}.results[0].title}}`}
                                </code>
                                <span className="text-muted-foreground">Title of top result</span>

                                {/* Top Result Snippet */}
                                <code className="bg-background border px-1.5 py-0.5 rounded text-foreground">
                                    {`{{${watchVariableName}.results[0].snippet}}`}
                                </code>
                                <span className="text-muted-foreground">Key info from first link</span>

                                {/* Top Result URL */}
                                <code className="bg-background border px-1.5 py-0.5 rounded text-foreground">
                                    {`{{${watchVariableName}.results[0].url}}`}
                                </code>
                                <span className="text-muted-foreground">Source URL</span>
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="ghost">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save Search Node</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};