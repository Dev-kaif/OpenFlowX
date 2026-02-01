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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";

import {
    useCreateSchedule,
    useUpdateSchedule,
    useScheduleByNode,
} from "./hook";
import { useParams } from "next/navigation";


export const scheduleFormSchema = z.object({
    mode: z.enum(["interval", "daily", "weekly"]),
    intervalMinutes: z.number().min(1).optional(),
    time: z.string().optional(),
    days: z.array(z.number()).optional(),
    timezone: z.string().min(1),
    enabled: z.boolean(),
});

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    nodeId: string;
    onSubmit: (values: ScheduleFormValues) => void;
    defaultValues?: Partial<ScheduleFormValues>;
}


export const ScheduleDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues,
    nodeId,
}: Props) => {
    const params = useParams();
    const workflowId = params.workflowID as string;

    const form = useForm<ScheduleFormValues>({
        resolver: zodResolver(scheduleFormSchema),
        defaultValues: {
            mode: defaultValues?.mode ?? "daily",
            intervalMinutes: defaultValues?.intervalMinutes ?? 15,
            time: defaultValues?.time ?? "09:00",
            days: defaultValues?.days ?? [],
            timezone:
                defaultValues?.timezone ??
                Intl.DateTimeFormat().resolvedOptions().timeZone,
            enabled: defaultValues?.enabled ?? true,
        },
    });

    const mode = form.watch("mode");

    const { data: existingSchedule } = useScheduleByNode(nodeId);

    const createSchedule = useCreateSchedule();
    const updateSchedule = useUpdateSchedule();

    const isSaving =
        createSchedule.isPending || updateSchedule.isPending;


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Schedule</DialogTitle>
                    <DialogDescription>
                        Run this workflow automatically on a schedule
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(async (values) => {
                            if (existingSchedule) {
                                await updateSchedule.mutateAsync({
                                    nodeId,
                                    ...values,
                                });
                            } else {
                                await createSchedule.mutateAsync({
                                    workflowId,
                                    nodeId,
                                    ...values,
                                });
                            }

                            onSubmit(values);
                            onOpenChange(false);
                        })}
                        className="space-y-4"
                    >
                        {/* Mode */}
                        <FormField
                            control={form.control}
                            name="mode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Schedule type</FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="interval">
                                                Every X minutes
                                            </SelectItem>
                                            <SelectItem value="daily">
                                                Daily
                                            </SelectItem>
                                            <SelectItem value="weekly">
                                                Weekly
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        {/* Interval */}
                        {mode === "interval" && (
                            <FormField
                                control={form.control}
                                name="intervalMinutes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Run every (minutes)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                placeholder="15"
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Time */}
                        {(mode === "daily" || mode === "weekly") && (
                            <FormField
                                control={form.control}
                                name="time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Days */}
                        {mode === "weekly" && (
                            <FormField
                                control={form.control}
                                name="days"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Days of week</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    "Sun",
                                                    "Mon",
                                                    "Tue",
                                                    "Wed",
                                                    "Thu",
                                                    "Fri",
                                                    "Sat",
                                                ].map((day, index) => {
                                                    const active =
                                                        field.value?.includes(
                                                            index
                                                        );
                                                    return (
                                                        <Button
                                                            key={day}
                                                            type="button"
                                                            size="sm"
                                                            variant={
                                                                active
                                                                    ? "default"
                                                                    : "outline"
                                                            }
                                                            onClick={() => {
                                                                const current =
                                                                    field.value ??
                                                                    [];
                                                                field.onChange(
                                                                    active
                                                                        ? current.filter(
                                                                            (d) =>
                                                                                d !==
                                                                                index
                                                                        )
                                                                        : [
                                                                            ...current,
                                                                            index,
                                                                        ]
                                                                );
                                                            }}
                                                        >
                                                            {day}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Timezone */}
                        <FormField
                            control={form.control}
                            name="timezone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Timezone</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Asia/Kolkata"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <DialogClose>Cancel</DialogClose>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? "Saving…" : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
