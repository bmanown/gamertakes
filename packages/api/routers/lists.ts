import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const listsRouter = createTRPCRouter({
  getForUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.list.findMany({
        where: { userId: input.userId, isPublic: true },
        include: { items: { include: { game: true }, orderBy: { position: 'asc' }, take: 4 } },
        orderBy: { updatedAt: 'desc' },
      })
    }),

  getById: publicProcedure
    .input(z.object({ listId: z.string() }))
    .query(async ({ input, ctx }) => {
      const list = await ctx.db.list.findUnique({
        where: { id: input.listId },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          items: { include: { game: true }, orderBy: { position: 'asc' } },
        },
      })
      if (!list) throw new TRPCError({ code: 'NOT_FOUND' })
      if (!list.isPublic && list.userId !== ctx.session?.user?.id)
        throw new TRPCError({ code: 'FORBIDDEN' })
      return list
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      description: z.string().max(2000).optional(),
      isPublic: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const list = await ctx.db.list.create({
        data: { userId: ctx.session.user.id, ...input },
      })
      await ctx.db.activity.create({
        data: { userId: ctx.session.user.id, type: 'CREATED_LIST', listId: list.id },
      })
      return list
    }),

  update: protectedProcedure
    .input(z.object({
      listId: z.string(),
      title: z.string().min(1).max(200).optional(),
      description: z.string().max(2000).optional(),
      isPublic: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const list = await ctx.db.list.findUnique({ where: { id: input.listId } })
      if (!list || list.userId !== ctx.session.user.id) throw new TRPCError({ code: 'FORBIDDEN' })
      const { listId, ...data } = input
      return ctx.db.list.update({ where: { id: listId }, data })
    }),

  delete: protectedProcedure
    .input(z.object({ listId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const list = await ctx.db.list.findUnique({ where: { id: input.listId } })
      if (!list || list.userId !== ctx.session.user.id) throw new TRPCError({ code: 'FORBIDDEN' })
      await ctx.db.list.delete({ where: { id: input.listId } })
    }),

  addGame: protectedProcedure
    .input(z.object({ listId: z.string(), gameId: z.string(), note: z.string().max(500).optional() }))
    .mutation(async ({ input, ctx }) => {
      const list = await ctx.db.list.findUnique({ where: { id: input.listId } })
      if (!list || list.userId !== ctx.session.user.id) throw new TRPCError({ code: 'FORBIDDEN' })
      const maxPos = await ctx.db.listItem.aggregate({
        where: { listId: input.listId },
        _max: { position: true },
      })
      return ctx.db.listItem.create({
        data: {
          listId: input.listId,
          gameId: input.gameId,
          note: input.note ?? null,
          position: (maxPos._max.position ?? -1) + 1,
        },
      })
    }),

  removeGame: protectedProcedure
    .input(z.object({ listId: z.string(), gameId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const list = await ctx.db.list.findUnique({ where: { id: input.listId } })
      if (!list || list.userId !== ctx.session.user.id) throw new TRPCError({ code: 'FORBIDDEN' })
      await ctx.db.listItem.deleteMany({ where: { listId: input.listId, gameId: input.gameId } })
    }),

  reorder: protectedProcedure
    .input(z.object({ listId: z.string(), orderedGameIds: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      const list = await ctx.db.list.findUnique({ where: { id: input.listId } })
      if (!list || list.userId !== ctx.session.user.id) throw new TRPCError({ code: 'FORBIDDEN' })
      await Promise.all(
        input.orderedGameIds.map((gameId, position) =>
          ctx.db.listItem.updateMany({ where: { listId: input.listId, gameId }, data: { position } })
        )
      )
    }),
})
