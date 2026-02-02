import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { generateSlug } from "random-word-slugs";
import { PAGINATION } from "@/config/constant";
import { NodeType } from "@/generated/prisma/enums";
import type { Edge, Node } from "@xyflow/react";
import sendWorkflowExecution from "@/inngest/utils/sendWorkflowExecution";

export const workflowsRouter = createTRPCRouter({
  create: protectedProcedure.mutation(({ ctx }) => {
    return prisma.workflow.create({
      data: {
        name: generateSlug(3),
        userId: ctx.userId,
        nodes: {
          create: {
            type: NodeType.INITIAL,
            position: { x: 0, y: 0 },
            name: NodeType.INITIAL
          },
        },
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
      return prisma.workflow.delete({
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
        nodes: z.array(
          z.object({
            id: z.string(),
            type: z.string().nullish(),
            position: z.object({ x: z.number(), y: z.number() }),
            data: z.record(z.string(), z.any()).optional(),
          }),
        ),
        edges: z.array(
          z.object({
            source: z.string(),
            target: z.string(),
            sourceHandle: z.string().optional(),
            targetHandle: z.string().optional(),
          })
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, nodes, edges } = input;

      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: id,
          userId: ctx.userId
        }
      })

      return await prisma.$transaction(async (tx) => {

        await tx.connection.deleteMany({
          where: { workflowId: id }
        })

        await tx.node.deleteMany({
          where: { workflowId: id }
        })

        await tx.node.createMany({
          data: nodes.map((node) => ({
            id: node.id,
            workflowId: id,
            name: node.type || "unknown",
            type: node.type as NodeType,
            position: node.position,
            data: node.data || {},
          }))
        });

        await tx.connection.createMany({
          data: edges.map((edge) => ({
            workflowId: id,
            fromNodeId: edge.source,
            toNodeId: edge.target,
            fromOutput: edge.sourceHandle ?? "main",
            toInput: edge.targetHandle ?? "main",
          })),
        });

        await tx.workflow.update({
          where: {
            id: id
          },
          data: {
            updatedAt: new Date()
          },
        })

        return workflow;
      })
    }),

  updateNodes: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nodes: z.array(
          z.object({
            id: z.string(),
            type: z.string().nullish(),
            position: z.object({ x: z.number(), y: z.number() }),
            data: z.record(z.string(), z.any()).optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, nodes } = input;

      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id,
          userId: ctx.auth.user.id,
        },
      });

      return await prisma.$transaction(async (tx) => {
        await tx.node.deleteMany({
          where: {
            workflowId: id,
          },
        });
        await tx.node.createMany({
          data: nodes.map((node) => ({
            id: node.id,
            type: node.type as NodeType,
            position: node.position,
            data: node.data || {},
            name: node.type || "",
            workflowId: id,
          })),
        });

        await tx.workflow.update({
          where: { id },
          data: { updatedAt: new Date() },
        });

        return workflow;
      });
    }),

  updateName: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(({ ctx, input }) => {
      return prisma.workflow.update({
        where: {
          userId: ctx.userId,
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });
    }),


  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {

      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
        include: {
          nodes: true,
          connections: true
        },
      });

      // transforming Server nodes to reactflow nodes
      const nodes: Node[] = workflow.nodes.map((node) => ({
        id: node.id,
        position: node.position as { x: number, y: number },
        type: node.type,
        data: node.data as Record<string, unknown>
      }))

      // transforming Server connections to reactflow connections
      const connections: Edge[] = workflow.connections.map((connection) => ({
        id: connection.id,
        source: connection.fromNodeId,
        target: connection.toNodeId,
        sourceHandle: connection.fromOutput,
        targetHandle: connection.toInput
      }))

      return { nodes, connections, id: workflow.id, name: workflow.name }
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
        prisma.workflow.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            userId: ctx.userId,
            name: {
              contains: search,
              mode: "insensitive"
            }
          },
          include: {
            nodes: {
              orderBy: {
                createdAt: 'asc',
              },
              take: 2,
              select: {
                id: true,
                type: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            updatedAt: "desc"
          },
        }),
        prisma.workflow.count({
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

  execute: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workflow = prisma.workflow.findFirstOrThrow({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });

      await sendWorkflowExecution({
        workflowId: input.id
      })

      return workflow;
    }),

});
