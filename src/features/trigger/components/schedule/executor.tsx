import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { scheduleChannel } from "@/inngest/channels/schedule";

type ScheduleNodeData = {
    mode?: "interval" | "daily" | "weekly";
    intervalMinutes?: number;
    time?: string;
    days?: number[];
    timezone?: string;
    enabled?: boolean;
};

export const ScheduleExecutor: NodeExecutor<ScheduleNodeData> = async ({
    data,
    nodeId,
    publish,
}) => {
    await publish(
        scheduleChannel().status({
            nodeId,
            status: "loading",
        }),
    );

    try {
        if (!data.mode) {
            throw new NonRetriableError("Schedule Node: mode is required");
        }

        if (!data.timezone) {
            throw new NonRetriableError("Schedule Node: timezone is required");
        }

        if (data.mode === "interval") {
            if (!data.intervalMinutes || data.intervalMinutes <= 0) {
                throw new NonRetriableError(
                    "Schedule Node: intervalMinutes must be greater than 0"
                );
            }
        }

        if (data.mode === "daily") {
            if (!data.time) {
                throw new NonRetriableError(
                    "Schedule Node: time is required for daily schedule"
                );
            }
        }

        if (data.mode === "weekly") {
            if (!data.time) {
                throw new NonRetriableError(
                    "Schedule Node: time is required for weekly schedule"
                );
            }

            if (!data.days || data.days.length === 0) {
                throw new NonRetriableError(
                    "Schedule Node: at least one day is required for weekly schedule"
                );
            }
        }

        // Scheduler node does NOT execute or modify context
        // It only stores metadata used by Inngest cron runner
        await publish(
            scheduleChannel().status({
                nodeId,
                status: "success",
            }),
        );

        return {};
    } catch (error) {
        await publish(
            scheduleChannel().status({
                nodeId,
                status: "error",
            }),
        );
        throw error;
    }
};
