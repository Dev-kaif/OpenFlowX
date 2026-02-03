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
    FormDescription,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";

export const delayFormSchema = z.discriminatedUnion("mode", [
    z.object({
        mode: z.literal("duration"),
        seconds: z.number().min(1, "Delay must be at least 1 second"),
    }),
    z.object({
        mode: z.literal("until"),
        until: z.string().min(1, "Target date or template is required"),
    }),
]);

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
            mode: defaultValues?.mode || "duration",
            seconds: defaultValues?.mode === "duration" ? defaultValues.seconds : 10,
            until: defaultValues?.mode === "until" ? defaultValues.until : "",
        } as any,
    });

    const watchMode = form.watch("mode");

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
                        {/* Mode Selection */}
                        <FormField
                            control={form.control}
                            name="mode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Delay Mode</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select mode" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="duration">Fixed Duration</SelectItem>
                                            <SelectItem value="until">Wait Until</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Duration Field */}
                        {watchMode === "duration" && (
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
                        )}

                        {/* Until Field */}
                        {watchMode === "until" && (
                            <FormField
                                control={form.control}
                                name="until"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Wait Until</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="{{step.targetDate}} or ISO string"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Accepts an ISO date string or a Handlebars template.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Helper Card */}
                        <div className="rounded-lg bg-muted p-4 space-y-3 text-sm">
                            <h4 className="font-medium">What this does</h4>

                            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
                                <li>
                                    Pauses the workflow execution without blocking server resources.
                                </li>
                                <li>
                                    {watchMode === "duration"
                                        ? "Resumes automatically after the specified seconds have passed."
                                        : "Resumes once the resolved date/time is reached."}
                                </li>
                                <li>
                                    Does not modify the workflow context; it only acts as a timer.
                                </li>
                            </ul>

                            <div className="space-y-2">
                                <p className="font-medium">Examples</p>
                                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
                                    {watchMode === "duration" ? (
                                        <>
                                            <code className="bg-background px-2 py-1 rounded text-xs">60</code>
                                            <span>Wait for 1 minute</span>
                                            <code className="bg-background px-2 py-1 rounded text-xs">3600</code>
                                            <span>Wait for 1 hour</span>
                                        </>
                                    ) : (
                                        <>
                                            <code className="bg-background px-2 py-1 rounded text-xs">
                                                {"{{ai.followUpDate}}"}
                                            </code>
                                            <span>Use date from AI output</span>
                                            <code className="bg-background px-2 py-1 rounded text-xs">
                                                2026-12-25T00:00:00Z
                                            </code>
                                            <span>Wait until Christmas</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground italic">
                                Tip: If the target date is in the past, the node will complete immediately.
                            </p>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="ghost">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};