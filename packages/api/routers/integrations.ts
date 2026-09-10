import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { fetchSteamLibrary, resolveSteamVanityUrl } from '../lib/steam'
import { fetchPSNLibrary, encryptToken, decryptToken, isoDurationToMinutes } from '../lib/psn'
import { upsertGameFromIGDB, searchIGDB } from '../lib/igdb'
import { TRPCError } from '@trpc/server'

export const integrationsRouter = createTRPCRouter({
  getIntegrationStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { steamId: true, psnId: true },
    })
    return { steam: !!user?.steamId, psn: !!user?.psnId }
  }),

  connectSteam: protectedProcedure
    .input(z.object({ steamInput: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      // Resolve vanity URL or use direct Steam ID
      let steamId = input.steamInput
      if (!/^\d+$/.test(steamId)) {
        steamId = await resolveSteamVanityUrl(steamId)
      }

      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { steamId },
      })

      return syncSteamForUser(ctx.session.user.id, steamId, ctx.db)
    }),

  syncSteam: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { steamId: true },
    })
    if (!user?.steamId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Steam not connected' })
    return syncSteamForUser(ctx.session.user.id, user.steamId, ctx.db)
  }),

  connectPSN: protectedProcedure
    .input(z.object({ npssoToken: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const encryptedToken = encryptToken(input.npssoToken)
      const games = await fetchPSNLibrary(input.npssoToken)

      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { psnToken: encryptedToken, psnId: ctx.session.user.id }, // psnId set after first sync
      })

      return syncPSNGames(ctx.session.user.id, games, ctx.db)
    }),

  syncPSN: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { psnToken: true },
    })
    if (!user?.psnToken) throw new TRPCError({ code: 'BAD_REQUEST', message: 'PSN not connected' })
    const token = decryptToken(user.psnToken)
    const games = await fetchPSNLibrary(token)
    return syncPSNGames(ctx.session.user.id, games, ctx.db)
  }),
})

async function syncSteamForUser(userId: string, steamId: string, db: {
  game: { findFirst: (args: unknown) => Promise<{ id: string } | null> }
  gameEntry: { upsert: (args: unknown) => Promise<unknown> }
}) {
  const steamGames = await fetchSteamLibrary(steamId)
  let updated = 0

  for (const steamGame of steamGames) {
    // Try to find matching game in our DB by Steam appid or title
    let game = await db.game.findFirst({
      where: { title: { equals: steamGame.name, mode: 'insensitive' } },
    })
    if (!game) {
      const results = await searchIGDB(steamGame.name)
      const match = results.find(
        (g) => g.name.toLowerCase() === steamGame.name.toLowerCase()
      )
      if (match) game = await upsertGameFromIGDB(match)
    }
    if (!game) continue

    await db.gameEntry.upsert({
      where: { userId_gameId: { userId, gameId: game.id } },
      create: { userId, gameId: game.id, status: 'SHELVED', steamMinutes: steamGame.playtime_forever },
      update: { steamMinutes: steamGame.playtime_forever },
    })
    updated++
  }
  return { updated }
}

async function syncPSNGames(userId: string, games: { name: string; playDuration: string }[], db: {
  game: { findFirst: (args: unknown) => Promise<{ id: string } | null> }
  gameEntry: { upsert: (args: unknown) => Promise<unknown> }
}) {
  let updated = 0
  for (const psnGame of games) {
    let game = await db.game.findFirst({
      where: { title: { equals: psnGame.name, mode: 'insensitive' } },
    })
    if (!game) {
      const results = await searchIGDB(psnGame.name)
      const match = results.find(
        (g) => g.name.toLowerCase() === psnGame.name.toLowerCase()
      )
      if (match) game = await upsertGameFromIGDB(match)
    }
    if (!game) continue

    const minutes = isoDurationToMinutes(psnGame.playDuration)
    await db.gameEntry.upsert({
      where: { userId_gameId: { userId, gameId: game.id } },
      create: { userId, gameId: game.id, status: 'SHELVED', psnMinutes: minutes },
      update: { psnMinutes: minutes },
    })
    updated++
  }
  return { updated }
}
