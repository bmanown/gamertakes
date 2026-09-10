import { db } from '@gamertakes/db'
import { matchAndSyncOpenCritic } from '../packages/api/lib/opencritic'

export async function syncOpenCriticScores(): Promise<{ synced: number }> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  // Games active in last 30 days that haven't been synced in last 24 hours
  const games = await db.game.findMany({
    where: {
      entries: { some: { updatedAt: { gte: thirtyDaysAgo } } },
      OR: [
        { openCriticLastSync: null },
        { openCriticLastSync: { lt: oneDayAgo } },
      ],
    },
    take: 200,
  })

  for (const game of games) {
    await matchAndSyncOpenCritic(game)
    await new Promise((r) => setTimeout(r, 500)) // Rate limit: 2 req/sec
  }

  return { synced: games.length }
}
