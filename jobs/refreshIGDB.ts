import { db } from '@gamertakes/db'
import { fetchIGDBGame, upsertGameFromIGDB } from '../packages/api/lib/igdb'

export async function refreshIGDBMetadata(): Promise<{ refreshed: number }> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const games = await db.game.findMany({
    where: {
      popularityScore: { gt: 0 },
      igdbLastSync: { lt: sevenDaysAgo },
    },
    orderBy: { popularityScore: 'desc' },
    take: 100,
  })

  for (const game of games) {
    try {
      const igdbGame = await fetchIGDBGame(game.igdbId)
      await upsertGameFromIGDB(igdbGame)
      await new Promise((r) => setTimeout(r, 250)) // Rate limit
    } catch (e) {
      console.error(`IGDB refresh failed for ${game.title}:`, e)
    }
  }

  return { refreshed: games.length }
}
