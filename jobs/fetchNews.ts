import { fetchRSSSource, upsertArticle, RSS_SOURCES } from '../packages/api/lib/rss'
import { db } from '@gamertakes/db'

export async function fetchAllNews(): Promise<{ fetched: number; sources: number }> {
  let totalFetched = 0

  for (const source of RSS_SOURCES) {
    const articles = await fetchRSSSource(source)
    for (const article of articles) {
      await upsertArticle(article)
      totalFetched++
    }
    await new Promise((r) => setTimeout(r, 2000))
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  await db.newsArticle.deleteMany({ where: { publishedAt: { lt: sevenDaysAgo } } })

  const count = await db.newsArticle.count()
  if (count > 500) {
    const oldest = await db.newsArticle.findMany({
      orderBy: { publishedAt: 'asc' },
      take: count - 500,
      select: { id: true },
    })
    await db.newsArticle.deleteMany({ where: { id: { in: oldest.map((a) => a.id) } } })
  }

  return { fetched: totalFetched, sources: RSS_SOURCES.length }
}
