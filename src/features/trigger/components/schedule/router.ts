import { PAGINATION } from "@/config/constant";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { calculateNextRun } from "./function";
import { inngest } from "@/inngest/client";

export const SchedulerRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                workflowId: z.string(),
                nodeId: z.string(),
                mode: z.enum(["interval", "daily", "weekly"]),
                intervalMinutes: z.number().min(1).optional(),
                time: z.string().optional(),
                days: z.array(z.number()).optional(),
                timezone: z.string(),
                enabled: z.boolean(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { workflowId, nodeId, ...schedule } = input;

            await prisma.workflow.findFirstOrThrow({
                where: {
                    id: workflowId,
                    userId: ctx.auth.user.id,
                },
                select: { id: true },
            });

            return prisma.schedule.create({
                data: {
                    workflowId,
                    nodeId,
                    ...schedule,
                },
            });
        }),



    update: protectedProcedure
        .input(
            z.object({
                nodeId: z.string(),
                mode: z.enum(["interval", "daily", "weekly"]),
                intervalMinutes: z.number().min(1).optional(),
                time: z.string().optional(),
                days: z.array(z.number()).optional(),
                timezone: z.string(),
                enabled: z.boolean(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { nodeId, ...schedule } = input;

            const existing = await prisma.schedule.findFirstOrThrow({
                where: {
                    nodeId,
                    workflow: {
                        userId: ctx.auth.user.id,
                    },
                },
                select: { id: true },
            });

            return prisma.schedule.update({
                where: { id: existing.id },
                data: schedule,
            });
        }),

    getScheduleByNode: protectedProcedure
        .input(z.object({ nodeId: z.string() }))
        .query(({ ctx, input }) => {
            return prisma.schedule.findFirst({
                where: {
                    nodeId: input.nodeId,
                    workflow: { userId: ctx.auth.user.id },
                },
            });
        }),

    deleteSchedule: protectedProcedure
        .input(
            z.object({
                nodeId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const schedule = await prisma.schedule.findFirstOrThrow({
                where: {
                    nodeId: input.nodeId,
                    workflow: {
                        userId: ctx.auth.user.id,
                    },
                },
                select: { id: true },
            });

            await prisma.schedule.delete({
                where: { id: schedule.id },
            });

            return { success: true };
        }),


    activate: protectedProcedure
        .input(
            z.object({
                nodeId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { nodeId } = input;

            // ownership check
            await prisma.node.findFirstOrThrow({
                where: {
                    id: nodeId,
                    workflow: { userId: ctx.auth.user.id },
                },
                select: { workflowId: true },
            });

            // fetch schedule
            const schedule = await prisma.schedule.findUnique({
                where: { nodeId },
            });

            if (!schedule) {
                throw new Error("Schedule not found");
            }


            // activate schedule
            const activeSchedule = await prisma.schedule.update({
                where: { id: schedule.id },
                data: {
                    isDraft: false,
                    enabled: true,
                    version: {
                        increment: 1
                    }
                },
            });

            // compute first run
            const nextRunAt = calculateNextRun(activeSchedule);

            if (!nextRunAt) {
                return activeSchedule;
            }

            // schedule first execution
            await inngest.send({
                name: "workflow/run.at",
                data: {
                    scheduleId: activeSchedule.id,
                    version: activeSchedule.version,
                    scheduledAt: nextRunAt.getTime(),
                },
                ts: nextRunAt.getTime(),
            });

            return activeSchedule;
        }),
})
