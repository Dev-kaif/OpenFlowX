import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { PAGINATION } from "@/config/constant";
import { CredentialType } from "@/generated/prisma/enums";
import { decryptApiKey, encryptApiKey, maskApiKey } from "@/lib/crypto";

export const credentialRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      type: z.enum(CredentialType),
      value: z.string()
    }))
    .mutation(({ ctx, input }) => {
      const { name, type, value } = input;

      const encrypted = encryptApiKey(value);
      const mask = maskApiKey(value)

      return prisma.credential.create({
        data: {
          name: name,
          userId: ctx.userId,
          type: type,
          value: encrypted,
          maskValue: mask
        },
      });
    }),

  remove: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return prisma.credential.delete({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(CredentialType),
        value: z.string()
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, type, value } = input;

      const encrypted = encryptApiKey(value);
      const mask = maskApiKey(value)

      return prisma.credential.update({
        where: {
          id: id,
          userId: ctx.userId,
        },
        data: {
          name: name,
          type: type,
          value: encrypted,
          maskValue: mask
        }
      })
    }),

  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const data = await prisma.credential.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.userId
        }
      })

      const decryptedValue = decryptApiKey(data.value);

      return {
        ...data,
        value: decryptedValue
      }
    }),

  getMany: protectedProcedure
    .input(z.object({
      page: z.number().default(PAGINATION.DEFAULT_PAGE),
      pageSize: z
        .number()
        .min(PAGINATION.MIN_PAGE_SIZE)
        .max(PAGINATION.MAX_PAGE_SIZE)
        .default(PAGINATION.DEFAULT_PAGE_SIZE),
      search: z.string().default("")
    }))
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      const [items, totalCount] = await Promise.all([
        prisma.credential.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            userId: ctx.userId,
            name: {
              contains: search,
              mode: "insensitive"
            }
          },
          orderBy: {
            updatedAt: "desc"
          },
        }),

        prisma.credential.count({
          where: {
            userId: ctx.userId,
            name: {
              contains: search,
              mode: "insensitive"
            }
          },
        })
      ])

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage
      };
    }),

  getByType: protectedProcedure
    .input(z.object({ type: z.enum(CredentialType) }))
    .query(async ({ input, ctx }) => {
      return prisma.credential.findMany({
        where: {
          userId: ctx.userId,
          type: input.type,
        },
        orderBy: {
          updatedAt: "asc"
        },
      })



    })

});
