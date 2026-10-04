import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const newsRouter = createTRPCRouter({
  getLatest: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(20),
        cursor: z.string().optional(),
        source: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const articles = await ctx.db.newsArticle.findMany({
        where: {
          ...(input.source ? { source: input.source } : {}),
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
        include: { game: { select: { id: true, slug: true, title: true } } },
      })
      let nextCursor: string | undefined
      if (articles.length > input.limit) {
        nextCursor = articles.pop()?.id
      }
      return { articles, nextCursor }
    }),

  getForGame: publicProcedure
    .input(z.object({ gameId: z.string(), limit: z.number().int().default(5) }))
    .query(async ({ input, ctx }) => {
      return ctx.db.newsArticle.findMany({
        where: { gameId: input.gameId },
        orderBy: { publishedAt: 'desc' },
        take: input.limit,
      })
    }),

  getSources: publicProcedure.query(async ({ ctx }) => {
    const sources = await ctx.db.newsArticle.findMany({
      select: { source: true },
      distinct: ['source'],
    })
    return sources.map((s) => s.source)
  }),
})
