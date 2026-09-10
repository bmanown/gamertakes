import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const usersRouter = createTRPCRouter({
  getProfile: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { username: input.username },
        select: {
          id: true, username: true, displayName: true, avatarUrl: true, bio: true,
          isPrivate: true, createdAt: true,
          _count: { select: { entries: true, reviews: true, lists: true, followers: true, following: true } },
        },
      })
      if (!user) throw new TRPCError({ code: 'NOT_FOUND' })
      return user
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      displayName: z.string().max(100).optional(),
      bio: z.string().max(500).optional(),
      isPrivate: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      })
    }),

  search: publicProcedure
    .input(z.object({ query: z.string().min(1).max(50) }))
    .query(async ({ input, ctx }) => {
      return ctx.db.user.findMany({
        where: {
          OR: [
            { username: { contains: input.query, mode: 'insensitive' } },
            { displayName: { contains: input.query, mode: 'insensitive' } },
          ],
          isPrivate: false,
        },
        select: { id: true, username: true, displayName: true, avatarUrl: true },
        take: 20,
      })
    }),
})
