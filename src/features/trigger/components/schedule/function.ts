import { inngest } from "@/inngest/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import sendWorkflowExecution from "@/inngest/utils/sendWorkflowExecution";
import prisma from "@/lib/db";
import type { Schedule } from "@/generated/prisma/client";

dayjs.extend(utc);
dayjs.extend(timezone);

function shouldRunNow(schedule: Schedule) {
    const now = dayjs().tz(schedule.timezone);

    if (schedule.mode === "interval") {
        if (!schedule.lastRunAt) return true;

        const diff = now.diff(dayjs(schedule.lastRunAt), "minute");
        return diff >= schedule.intervalMinutes!;
    }

    if (schedule.mode === "daily") {
        return (
            now.format("HH:mm") === schedule.time &&
            (!schedule.lastRunAt ||
                now.format("YYYY-MM-DD") !==
                dayjs(schedule.lastRunAt)
                    .tz(schedule.timezone)
                    .format("YYYY-MM-DD"))
        );
    }

    if (schedule.mode === "weekly") {
        return (
            schedule.days.includes(now.day()) &&
            now.format("HH:mm") === schedule.time &&
            (!schedule.lastRunAt ||
                now.format("YYYY-MM-DD") !==
                dayjs(schedule.lastRunAt)
                    .tz(schedule.timezone)
                    .format("YYYY-MM-DD"))
        );
    }

    return false;
}

export const scheduleRunner = inngest.createFunction(
    { id: "scheduler-runner" },
    { cron: "* * * * *" },
    async () => {
        const schedules = await prisma.schedule.findMany({
            where: { enabled: true, isDraft: false },
        });

        for (const schedule of schedules) {
            if (!shouldRunNow(schedule)) continue;

            await sendWorkflowExecution({
                workflowId: schedule.workflowId,
                trigger: "schedule",
                scheduleId: schedule.id,
                scheduledAt: new Date().toISOString(),
            });

            await prisma.schedule.update({
                where: { id: schedule.id },
                data: { lastRunAt: new Date() },
            });
        }
    }
);
