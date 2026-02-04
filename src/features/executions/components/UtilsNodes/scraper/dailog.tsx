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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Key, AlertCircle, ExternalLink } from "lucide-react";
import { useCredentialsByType } from "@/features/credentails/hooks/useCredentials";
import { CredentialType } from "@/generated/prisma/enums";

export const scraperSchema = z.object({
    variableName: z
        .string()
        .min(1, "Variable name is required")
        .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "Invalid variable name"),
    url: z.string().min(1, "URL is required"),
    credentialId: z.string().optional(),
});

export type ScraperFormValues = z.infer<typeof scraperSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: ScraperFormValues) => void;
    defaultValues?: Partial<ScraperFormValues>;
}

export const ScraperDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues,
}: Props) => {
    const { data: credentials, isLoading } =
        useCredentialsByType(CredentialType.SCRAPINGBEE);

    const form = useForm<ScraperFormValues>({
        resolver: zodResolver(scraperSchema),
        defaultValues: {
            variableName: defaultValues?.variableName ?? "scraped",
            url: defaultValues?.url ?? "{{search.results[0].url}}",
            credentialId: defaultValues?.credentialId ?? "system",
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues?.variableName ?? "scraped",
                url: defaultValues?.url ?? "{{search.results[0].url}}",
                credentialId: defaultValues?.credentialId ?? "system",
            });
        }
    }, [open, form, defaultValues]);

    const watchVariableName = form.watch("variableName") || "scraped";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        Web Scraper
                    </DialogTitle>
                    <DialogDescription>
                        Extract clean, readable content using ScrapingBee.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit((values) => {
                            const payload = {
                                ...values,
                                credentialId:
                                    values.credentialId === "system"
                                        ? ""
                                        : values.credentialId,
                            };
                            onSubmit(payload);
                            onOpenChange(false);
                        })}
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
                                        <Input placeholder="scraped" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Access via{" "}
                                        <code className="text-xs">{`{{${watchVariableName}.text}}`}</code>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* URL */}
                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Target URL or List</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="{{search.results}}"
                                            className="font-mono text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Credential */}
                        <FormField
                            control={form.control}
                            name="credentialId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Key className="w-3.5 h-3.5" />
                                        ScrapingBee API Key (Optional)
                                    </FormLabel>

                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Use system default" />
                                            </SelectTrigger>
                                        </FormControl>

                                        <SelectContent>
                                            <SelectItem value="system">
                                                Use system default
                                            </SelectItem>

                                            {credentials?.map((cred) => (
                                                <SelectItem key={cred.id} value={cred.id}>
                                                    {cred.name}
                                                </SelectItem>
                                            ))}

                                            {(!credentials || credentials.length === 0) &&
                                                !isLoading && (
                                                    <div className="p-2 text-center">
                                                        <p className="text-[10px] text-muted-foreground">
                                                            No ScrapingBee keys found
                                                        </p>
                                                    </div>
                                                )}
                                        </SelectContent>
                                    </Select>

                                    <div className="flex gap-2 mt-2 p-2.5 rounded-md bg-amber-50 border border-amber-100 text-[11px] text-amber-800">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <p>
                                            <b>Note:</b> OpenFlowX provides limited free scraping.
                                            For JavaScript-heavy sites, higher rate limits, or fewer failures,
                                            add your own <b>ScrapingBee API key</b>.
                                            {" "}
                                            <a
                                                href="https://www.scrapingbee.com/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 underline underline-offset-2 font-medium"
                                            >
                                                Get a key
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </p>
                                    </div>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Output Mapping */}
                        <div className="rounded-lg bg-muted p-3 text-[11px] space-y-2">
                            <p className="font-semibold text-muted-foreground uppercase tracking-wider">
                                Output mapping
                            </p>

                            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
                                <code className="bg-background border px-1.5 py-0.5 rounded font-medium">
                                    {`{{${watchVariableName}.text}}`}
                                </code>
                                <span className="text-muted-foreground">
                                    Clean readable content (Markdown)
                                </span>

                                <code className="bg-background border px-1.5 py-0.5 rounded">
                                    {`{{${watchVariableName}.url}}`}
                                </code>
                                <span className="text-muted-foreground">
                                    Source URL
                                </span>
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="ghost">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save Scraper Node</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
