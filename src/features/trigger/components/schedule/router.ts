import { PAGINATION } from "@/config/constant";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";

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

            await prisma.node.findFirstOrThrow({
                where: {
                    id: nodeId,
                    workflow: { userId: ctx.auth.user.id },
                },
                select: { workflowId: true },
            });

            return prisma.schedule.update({
                where: { nodeId },
                data: {
                    isDraft: false,
                    enabled: true,
                },
            });
        })

})