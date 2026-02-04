import { inngest } from "@/inngest/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import sendWorkflowExecution from "@/inngest/utils/sendWorkflowExecution";
import prisma from "@/lib/db";
import type { Schedule } from "@/generated/prisma/client";

dayjs.extend(utc);
dayjs.extend(timezone);

function parseTime(time: string) {
    const [hour, minute] = time.split(":").map(Number);
    return { hour, minute };
}

export function calculateNextRun(schedule: Schedule): Date | null {
    const now = dayjs().tz(schedule.timezone);

    if (schedule.mode === "interval") {
        const base = schedule.lastRunAt
            ? dayjs(schedule.lastRunAt).tz(schedule.timezone)
            : now;

        return base
            .add(schedule.intervalMinutes!, "minute")
            .toDate();
    }

    if (schedule.mode === "daily") {
        if (!schedule.time) return null;

        const { hour, minute } = parseTime(schedule.time);

        let next = now
            .hour(hour)
            .minute(minute)
            .second(0);

        if (next.isBefore(now)) {
            next = next.add(1, "day");
        }

        return next.toDate();
    }

    if (schedule.mode === "weekly") {
        if (!schedule.time || !schedule.days?.length) return null;

        const { hour, minute } = parseTime(schedule.time);
        const targetDays = [...schedule.days].sort();

        for (let i = 0; i < 7; i++) {
            const candidate = now.add(i, "day");

            if (!targetDays.includes(candidate.day())) continue;

            const scheduledTime = candidate
                .hour(hour)
                .minute(minute)
                .second(0);

            if (scheduledTime.isAfter(now)) {
                return scheduledTime.toDate();
            }
        }

        // fallback → next week
        return now
            .add(1, "week")
            .day(targetDays[0])
            .hour(hour)
            .minute(minute)
            .second(0)
            .toDate();
    }

    return null;
}


export const runScheduledWorkflow = inngest.createFunction(
    {
        id: "run-scheduled-workflow",
    },
    { event: "workflow/run.at" },
    async ({ event, step }) => {
        const { scheduleId, version, scheduledAt } = event.data as {
            scheduleId: string;
            version: number;
            scheduledAt: number;
        };

        // always fetch fresh state
        const schedule = await prisma.schedule.findUnique({
            where: { id: scheduleId },
        });

        // hard guards
        if (!schedule || schedule.isDraft || !schedule.enabled || schedule.version !== version) {
            console.log("[RUNNER] guard exit", {
                scheduleId,
                exists: !!schedule,
                isDraft: schedule?.isDraft,
                enabled: schedule?.enabled,
            });
            return;
        }

        if (schedule.lastRunAt && schedule.lastRunAt.getTime() >= scheduledAt) {
            console.log("[RUNNER] Skipping execution - already ran", {
                lastRunAt: schedule.lastRunAt,
                scheduledAt: new Date(scheduledAt)
            });
            return;
        }

        const now = new Date();

        // Run workflow
        await sendWorkflowExecution({
            workflowId: schedule.workflowId,
            trigger: "schedule",
            scheduleId: schedule.id,
            scheduledAt: now.toISOString(),
        });


        // Persist last run
        const updatedSchedule = await prisma.schedule.update({
            where: { id: schedule.id },
            data: { lastRunAt: now },
        });

        // Schedule NEXT execution
        const nextRunAt = calculateNextRun(updatedSchedule);

        if (!nextRunAt) {
            return;
        }

        await step.sendEvent("schedule-next-run", {
            name: "workflow/run.at",
            data: {
                scheduleId: updatedSchedule.id,
                version: updatedSchedule.version,
                scheduledAt: nextRunAt.getTime()
            },
            ts: nextRunAt.getTime(),
        });
    }
);
