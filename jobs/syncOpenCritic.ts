import { db } from '@gamertakes/db'
import { fillCriticScore } from '../packages/api/lib/opencritic'
import { openCriticSyncQuery } from './openCriticQuery'

export async function syncOpenCriticScores(): Promise<{ synced: number }> {
  const games = await db.game.findMany(openCriticSyncQuery())

  for (const game of games) {
    await fillCriticScore(game)
    await new Promise((r) => setTimeout(r, 500))
  }

  return { synced: games.length }
}
