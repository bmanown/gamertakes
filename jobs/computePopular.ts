import { db } from '@gamertakes/db'
import { popularityScore } from './popularity'

export async function computePopularGames(): Promise<{ updated: number }> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const games = await db.game.findMany({
    include: {
      _count: {
        select: {
          entries: { where: { updatedAt: { gte: thirtyDaysAgo } } },
          reviews: { where: { createdAt: { gte: thirtyDaysAgo } } },
        },
      },
    },
  })

  for (const game of games) {
    const score = popularityScore(game._count.entries, game._count.reviews)
    await db.game.update({
      where: { id: game.id },
      data: { popularityScore: score },
    })
  }

  return { updated: games.length }
}
