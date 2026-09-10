import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const activityRouter = createTRPCRouter({
  getUserActivity: publicProcedure
    .input(z.object({
      userId: z.string(),
      cursor: z.string().optional(),
      limit: z.number().int().default(20),
    }))
    .query(async ({ input, ctx }) => {
      const activities = await ctx.db.activity.findMany({
        where: { userId: input.userId },
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
