import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const reviewsRouter = createTRPCRouter({
  getForGame: publicProcedure
    .input(z.object({
      gameId: z.string(),
      cursor: z.string().optional(),
      limit: z.number().int().min(1).max(50).default(10),
    }))
    .query(async ({ input, ctx }) => {
      const reviews = await ctx.db.review.findMany({
        where: { gameId: input.gameId },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          entry: { select: { rating: true } },
          likes: { select: { userId: true } },
        },
      })
      let nextCursor: string | undefined
      if (reviews.length > input.limit) {
        const next = reviews.pop()
        nextCursor = next?.id
      }
      return { reviews, nextCursor }
    }),

  getForUser: publicProcedure
    .input(z.object({
      userId: z.string(),
      cursor: z.string().optional(),
      limit: z.number().int().default(10),
    }))
    .query(async ({ input, ctx }) => {
      const reviews = await ctx.db.review.findMany({
        where: { userId: input.userId },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          game: true,
          entry: { select: { rating: true } },
        },
      })
      let nextCursor: string | undefined
      if (reviews.length > input.limit) {
        const next = reviews.pop()
        nextCursor = next?.id
      }
      return { reviews, nextCursor }
    }),

  create: protectedProcedure
    .input(z.object({
      gameId: z.string(),
      body: z.string().min(10).max(10000),
      containsSpoilers: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id
      const entry = await ctx.db.gameEntry.findUnique({
        where: { userId_gameId: { userId, gameId: input.gameId } },
        include: { review: true },
      })
      if (!entry) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Add game to library before reviewing' })
      if (entry.review) throw new TRPCError({ code: 'CONFLICT', message: 'Review already exists' })

      const review = await ctx.db.review.create({
        data: {
          userId,
          gameId: input.gameId,
          entryId: entry.id,
          body: input.body,
          containsSpoilers: input.containsSpoilers,
        },
      })
      await ctx.db.activity.create({
        data: { userId, type: 'REVIEWED_GAME', gameId: input.gameId, reviewId: review.id },
      })
      return review
    }),

  update: protectedProcedure
    .input(z.object({
      reviewId: z.string(),
      body: z.string().min(10).max(10000),
      containsSpoilers: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const review = await ctx.db.review.findUnique({ where: { id: input.reviewId } })
      if (!review || review.userId !== ctx.session.user.id)
        throw new TRPCError({ code: 'FORBIDDEN' })
      return ctx.db.review.update({
        where: { id: input.reviewId },
        data: { body: input.body, containsSpoilers: input.containsSpoilers },
      })
    }),

  delete: protectedProcedure
    .input(z.object({ reviewId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const review = await ctx.db.review.findUnique({ where: { id: input.reviewId } })
      if (!review || review.userId !== ctx.session.user.id)
        throw new TRPCError({ code: 'FORBIDDEN' })
      await ctx.db.review.delete({ where: { id: input.reviewId } })
    }),

  like: protectedProcedure
    .input(z.object({ reviewId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.reviewLike.upsert({
        where: { userId_reviewId: { userId: ctx.session.user.id, reviewId: input.reviewId } },
        create: { userId: ctx.session.user.id, reviewId: input.reviewId },
        update: {},
      })
    }),

  unlike: protectedProcedure
    .input(z.object({ reviewId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.reviewLike.deleteMany({
        where: { userId: ctx.session.user.id, reviewId: input.reviewId },
      })
    }),
})
