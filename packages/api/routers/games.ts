import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { cacheIGDBGames, gameFromIGDB, searchIGDB, upsertGameFromIGDB } from '../lib/igdb'
import { fillCriticScore } from '../lib/opencritic'
import { officialGameWhere } from '../lib/official'
import { TRPCError } from '@trpc/server'

export const gamesRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1).max(100),
      platform: z.string().optional(),
      genre: z.string().optional(),
      year: z.number().int().optional(),
      official: z.boolean().default(true),
    }))
    .query(async ({ input, ctx }) => {
      // First check local cache
      const local = await ctx.db.game.findMany({
        where: {
          title: { contains: input.query, mode: 'insensitive' },
          ...(input.platform ? { platforms: { has: input.platform } } : {}),
          ...(input.genre ? { genres: { has: input.genre } } : {}),
          ...(input.official ? officialGameWhere() : {}),
        },
        take: 20,
        orderBy: { popularityScore: 'desc' },
      })
      if (local.length >= 5) return local

      // Fall back to IGDB and cache results
      const igdbResults = await searchIGDB(input.query, {
        platform: input.platform,
        genre: input.genre,
        year: input.year,
        official: input.official,
      })
      cacheIGDBGames(igdbResults)
      const existing = await ctx.db.game.findMany({
        where: { igdbId: { in: igdbResults.map((game) => game.id) } },
      })
      const byIgdbId = new Map(existing.map((game) => [game.igdbId, game]))
      return igdbResults.map((game) => byIgdbId.get(game.id) ?? gameFromIGDB(game))
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      let game = await ctx.db.game.findUnique({ where: { slug: input.slug } })
      if (!game) {
        // Try fetching from IGDB by slug
        const results = await searchIGDB(input.slug)
        const match = results.find((g) => g.slug === input.slug)
        if (!match) throw new TRPCError({ code: 'NOT_FOUND', message: 'Game not found' })
        game = await upsertGameFromIGDB(match)
      }

      if (!game.openCriticLastSync) {
        await fillCriticScore(game)
        game = (await ctx.db.game.findUnique({ where: { id: game.id } })) ?? game
      }

      const [communityRating, totalRatings] = await Promise.all([
        ctx.db.gameEntry.aggregate({
          where: { gameId: game.id, rating: { not: null } },
          _avg: { rating: true },
        }),
        ctx.db.gameEntry.count({
          where: { gameId: game.id, rating: { not: null } },
        }),
      ])

      return {
        ...game,
        communityRating: communityRating._avg.rating,
        totalRatings,
      }
    }),

  getPopular: publicProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(50).default(12),
      official: z.boolean().default(true),
    }))
    .query(async ({ input, ctx }) => {
      return ctx.db.game.findMany({
        where: input.official ? officialGameWhere() : undefined,
        orderBy: { popularityScore: 'desc' },
        take: input.limit,
      })
    }),

  getSimilar: publicProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input, ctx }) => {
      const game = await ctx.db.game.findUnique({ where: { id: input.gameId } })
      if (!game || !game.similarGames.length) return []
      return ctx.db.game.findMany({
        where: { igdbId: { in: game.similarGames } },
        take: 8,
      })
    }),
})
