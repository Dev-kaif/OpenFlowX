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

export const delayFormSchema = z.object({
    seconds: z
        .number()
        .min(1, "Delay must be at least 1 second"),
});

export type DelayFormValues = z.infer<typeof delayFormSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: DelayFormValues) => void;
    defaultValues?: Partial<DelayFormValues>;
}

export const DelayDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues,
}: Props) => {
    const form = useForm<DelayFormValues>({
        resolver: zodResolver(delayFormSchema),
        defaultValues: {
            seconds: defaultValues?.seconds ?? 10,
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Delay</DialogTitle>
                    <DialogDescription>
                        Pause workflow execution before continuing
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
                        <FormField
                            control={form.control}
                            name="seconds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Wait for (seconds)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            placeholder="10"
                                            {...field}
                                            onChange={(e) =>
                                                field.onChange(Number(e.target.value))
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Helper Card */}
                        <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
                            <h4 className="font-medium">What this does</h4>
                            <ul className="list-disc pl-5 text-muted-foreground">
                                <li>Pauses the workflow for the given time</li>
                                <li>Does not block the server</li>
                                <li>Execution resumes automatically</li>
                            </ul>

                            <p className="text-xs text-muted-foreground">
                                Tip: For scheduled runs, use a trigger instead of Delay.
                            </p>
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
