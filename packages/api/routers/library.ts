import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'
import { GameStatus } from '@gamertakes/db'

const statusEnum = z.enum(['PLAYING', 'COMPLETED', 'WANT_TO_PLAY', 'DROPPED', 'SHELVED'])

export const libraryRouter = createTRPCRouter({
  getLibrary: publicProcedure
    .input(z.object({
      userId: z.string(),
      status: statusEnum.optional(),
      platform: z.string().optional(),
      genre: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      return ctx.db.gameEntry.findMany({
        where: {
          userId: input.userId,
          ...(input.status ? { status: input.status as GameStatus } : {}),
          ...(input.platform ? { game: { platforms: { has: input.platform } } } : {}),
          ...(input.genre ? { game: { genres: { has: input.genre } } } : {}),
        },
        include: { game: true },
        orderBy: { updatedAt: 'desc' },
      })
    }),

  getEntry: publicProcedure
    .input(z.object({ gameId: z.string(), userId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.gameEntry.findUnique({
        where: { userId_gameId: { userId: input.userId, gameId: input.gameId } },
        include: { game: true, review: true },
      })
    }),

  addOrUpdate: protectedProcedure
    .input(z.object({
      gameId: z.string(),
      status: statusEnum,
      rating: z.number().int().min(1).max(5).optional(),
      startedAt: z.date().optional(),
      completedAt: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id
      const entry = await ctx.db.gameEntry.upsert({
        where: { userId_gameId: { userId, gameId: input.gameId } },
        create: {
          userId,
          gameId: input.gameId,
          status: input.status as GameStatus,
          rating: input.rating ?? null,
          startedAt: input.startedAt ?? null,
          completedAt: input.completedAt ?? null,
        },
        update: {
          status: input.status as GameStatus,
          ...(input.rating !== undefined ? { rating: input.rating } : {}),
          ...(input.startedAt ? { startedAt: input.startedAt } : {}),
          ...(input.completedAt ? { completedAt: input.completedAt } : {}),
        },
      })

      // Write activity
      const activityType = input.rating ? 'RATED_GAME' : 'ADDED_GAME'
      await ctx.db.activity.create({
        data: {
          userId,
          type: activityType,
          gameId: input.gameId,
          metadata: { status: input.status, rating: input.rating ?? null },
        },
      })

      return entry
    }),

  remove: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id
      await ctx.db.gameEntry.delete({
        where: { userId_gameId: { userId, gameId: input.gameId } },
      })
    }),
})
