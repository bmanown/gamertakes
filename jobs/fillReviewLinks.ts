import { db } from '@gamertakes/db'
import { fetchAndCacheReviewLinks, uncachedReviewLinksQuery } from '../packages/api/lib/review-links'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fillReviewLinksBatch() {
  const games = await db.game.findMany(uncachedReviewLinksQuery())
  for (const game of games) {
    await fetchAndCacheReviewLinks(game.id, game.title, game.openCriticId)
    await sleep(250)
  }
  return { selected: games.length }
}
