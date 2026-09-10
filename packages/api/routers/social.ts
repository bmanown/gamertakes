import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const socialRouter = createTRPCRouter({
  follow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.session.user.id)
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot follow yourself' })
      await ctx.db.follow.upsert({
        where: { followerId_followingId: { followerId: ctx.session.user.id, followingId: input.userId } },
        create: { followerId: ctx.session.user.id, followingId: input.userId },
        update: {},
      })
      await ctx.db.activity.create({
        data: { userId: ctx.session.user.id, type: 'FOLLOWED_USER', metadata: { followedUserId: input.userId } },
      })
    }),

  unfollow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.follow.deleteMany({
        where: { followerId: ctx.session.user.id, followingId: input.userId },
      })
    }),

  getFollowers: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const follows = await ctx.db.follow.findMany({
        where: { followingId: input.userId },
        include: { follower: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
      })
      return follows.map((f) => f.follower)
    }),

  getFollowing: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const follows = await ctx.db.follow.findMany({
        where: { followerId: input.userId },
        include: { following: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
      })
      return follows.map((f) => f.following)
    }),

  getFeed: protectedProcedure
    .input(z.object({ cursor: z.string().optional(), limit: z.number().int().default(20) }))
    .query(async ({ input, ctx }) => {
      const following = await ctx.db.follow.findMany({
        where: { followerId: ctx.session.user.id },
        select: { followingId: true },
      })
      const followingIds = following.map((f) => f.followingId)

      const activities = await ctx.db.activity.findMany({
        where: { userId: { in: followingIds } },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          game: { select: { id: true, slug: true, title: true, coverImage: true } },
        },
      })

      let nextCursor: string | undefined
      if (activities.length > input.limit) {
        const next = activities.pop()
        nextCursor = next?.id
      }
      return { activities, nextCursor }
    }),
})
