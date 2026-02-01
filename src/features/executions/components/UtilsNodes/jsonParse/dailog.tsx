"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Button } from "@/components/ui/button";

export const jsonParseSchema = z.object({
    variableName: z.string().min(1),
    input: z.string().min(1),
});

export type JsonParseFormValues = z.infer<typeof jsonParseSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: JsonParseFormValues) => void;
    defaultValues?: Partial<JsonParseFormValues>;
}

export const JsonParseDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues,
}: Props) => {
    const form = useForm<JsonParseFormValues>({
        resolver: zodResolver(jsonParseSchema),
        defaultValues: {
            variableName: defaultValues?.variableName ?? "parsed",
            input: defaultValues?.input ?? "{{ai.text}}",
        },
    });

    const watchVariableName = form.watch("variableName") || "parsed";


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>JSON Parse</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit((v) => {
                            onSubmit(v);
                            onOpenChange(false);
                        })}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="variableName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Output Variable</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="input"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>JSON String</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="font-mono text-xs h-32"
                                            {...field}
                                        />
                                    </FormControl>
                                    <p className="text-[10px] text-muted-foreground">
                                        Must resolve to valid JSON (e.g. <code>{`{{ai.text}}`}</code>)
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            This node converts a JSON <b>string</b> into a real object.
                            <br />
                            In the next node, access actual json fields like:
                            <br />
                            <code className="block mt-1">
                                {`{{${watchVariableName}.subject}}`}<br />
                                {`{{${watchVariableName}.html}}`}<br />
                                {`{{${watchVariableName}.to}}`}
                            </code>
                        </p>

                        <DialogFooter>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
