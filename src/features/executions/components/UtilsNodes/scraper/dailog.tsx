"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
import { Eye } from "lucide-react";

export const scraperSchema = z.object({
    variableName: z
        .string()
        .min(1, "Variable name is required")
        .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "Invalid variable name"),
    url: z.string().min(1, "URL is required"),
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
    const form = useForm<ScraperFormValues>({
        resolver: zodResolver(scraperSchema),
        defaultValues: {
            variableName: defaultValues?.variableName ?? "page_content",
            url: defaultValues?.url ?? "{{search.results[0].url}}",
        },
    });

    const watchVariableName = form.watch("variableName") || "content";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-purple-500" />
                        Web Scraper (Reader)
                    </DialogTitle>
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
                                        <Input placeholder="article" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Helper Card */}
                        <div className="rounded-lg bg-muted p-3 text-xs space-y-2">
                            <p className="font-medium">Output Variable</p>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <code className="bg-background px-1.5 py-0.5 rounded">
                                    {`{{${watchVariableName}.text}}`}
                                </code>
                                <span>Clean Markdown content</span>
                            </div>
                        </div>

                        {/* URL Input */}
                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Target URL or List</FormLabel>
                                    <FormControl>
                                        <Input placeholder="{{search.results}}" {...field} />
                                    </FormControl>
                                    <div className="rounded-lg bg-muted p-3 text-xs space-y-2">
                                        <p className="font-medium">Supported inputs</p>

                                        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-muted-foreground">
                                            <code className="bg-background px-1.5 py-0.5 rounded">
                                                https://example.com
                                            </code>
                                            <span>Single URL</span>

                                            <code className="bg-background px-1.5 py-0.5 rounded">
                                                {`{{search.results}}`}
                                            </code>
                                            <span>Top 3 search result URLs</span>

                                            <code className="bg-background px-1.5 py-0.5 rounded">
                                                {`{{search.results[0].url}}`}
                                            </code>
                                            <span>Specific result URL</span>
                                        </div>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save Scraper</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};