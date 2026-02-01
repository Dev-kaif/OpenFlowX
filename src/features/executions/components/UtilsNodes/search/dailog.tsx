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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export const searchSchema = z.object({
    variableName: z
        .string()
        .min(1, "Variable name is required")
        .regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "Invalid variable name"),
    query: z.string().min(1, "Search query is required"),
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

    const form = useForm<SearchFormValues>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            variableName: defaultValues?.variableName ?? "search",
            query: defaultValues?.query ?? "",
        },
    });

    const watchVariableName = form.watch("variableName") || "search";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-500" />
                        Google Search
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
                                        <Input placeholder="google_result" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Helper Card */}
                        <div className="rounded-lg bg-muted p-3 text-xs space-y-2">
                            <p className="font-medium">Available variables in next node</p>
                            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-muted-foreground">
                                <code className="bg-background px-1.5 py-0.5 rounded">
                                    {`{{${watchVariableName}.results[0].url}}`}
                                </code>
                                <span>First url</span>

                                <code className="bg-background px-1.5 py-0.5 rounded">
                                    {`{{${watchVariableName}.results}`}
                                </code>
                                <span>List of objects (Title, Link)</span>

                                <code className="bg-background px-1.5 py-0.5 rounded">
                                    {`{{${watchVariableName}.text}}`}
                                </code>
                                <span>Summary string</span>

                            </div>
                        </div>

                        {/* Query */}
                        <FormField
                            control={form.control}
                            name="query"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Search Query</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="What is the price of Bitcoin?"
                                            className="h-24 resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <p className="text-[10px] text-muted-foreground">
                                        You can use variables like <code>{`{{node.data}}`}</code>
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save Search Node</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};