import prisma from "@/lib/db";
import { Payload, signTelegram } from "@/lib/sign";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";


export const settingsRouter = createTRPCRouter({
    getSettings: protectedProcedure
        .query(async ({ ctx }) => {
            const user = await prisma.user.findUnique({
                where: { id: ctx.userId },
                include: {
                    sessions: {
                        orderBy: { updatedAt: 'desc' }
                    },
                    accounts: {
                        select: { providerId: true, id: true }
                    }
                }
            });

            if (!user) throw new TRPCError({ code: "NOT_FOUND" });

            return {
                ...user,
                sessions: user.sessions.map(session => ({
                    ...session,
                    isCurrent: session.id === ctx.auth.session.id
                })),
                hasPassword: user.accounts.some(acc => acc.providerId === "credential"),
            };
        }),

    revokeSession: protectedProcedure
        .input(z.object({
            sessionId: z.string()
        }))
        .mutation(async ({ ctx, input }) => {

            if (input.sessionId === ctx.auth.session.id) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot revoke current session" });
            }

            return await prisma.session.delete({
                where: {
                    id: input.sessionId,
                    userId: ctx.userId
                }
            });
        }),

    unlinkAccount: protectedProcedure
        .input(z.object({
            providerId: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            return await prisma.account.deleteMany({
                where: {
                    userId: ctx.userId,
                    providerId: input.providerId
                }
            });
        }),

    getConnectLink: protectedProcedure.query(({ ctx }) => {
        const botUsername = process.env.TELEGRAM_BOT_USERNAME;

        if (!botUsername) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Telegram bot username not configured",
            });
        }

        const expiresAt = Date.now() + 10 * 60 * 1000;

        const payload = {
            userId: ctx.userId,
            action: "connect",
            exp: expiresAt,
        } as Payload;

        const token = signTelegram(payload);


        return {
            botUsername,
            url: `https://t.me/${botUsername}?start=${token}`,
            command: `/start ${token}`,
            expiresAt: new Date(expiresAt).toISOString(),
        };
    }),

    getTelegramStatus: protectedProcedure.query(async ({ ctx }) => {
        const connection = await prisma.telegramConnection.findFirst({
            where: {
                userId: ctx.userId,
            },
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                isActive: true,
                lastMessageAt: true,
            },
        });

        return {
            connected: !!connection && connection.isActive,
            connection,
        };
    }),

    deleteTelegramConnection: protectedProcedure
        .mutation(async ({ ctx }) => {
            const deleted = await prisma.telegramConnection.deleteMany({
                where: {
                    userId: ctx.userId,
                },
            });

            if (deleted.count === 0) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "No Telegram connection found",
                });
            }

            return {
                success: true,
            };
        }),

    disconnectTelegram: protectedProcedure
        .mutation(async ({ ctx }) => {
            const connection = await prisma.telegramConnection.findFirst({
                where: {
                    userId: ctx.userId,
                    isActive: true,
                },
            });

            if (!connection) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "No active Telegram connection found",
                });
            }

            await prisma.telegramConnection.update({
                where: { id: connection.id },
                data: {
                    isActive: false,
                },
            });

            return {
                success: true,
            };
        }),

})

