import Parser from 'rss-parser'
import { db } from '@gamertakes/db'

const parser = new Parser({
  headers: { 'User-Agent': 'GamerTakes/1.0 (gamertakes.com)' },
  timeout: 10000,
})

export const RSS_SOURCES = [
  { name: 'IGN', url: 'https://feeds.ign.com/ign/all' },
  { name: 'Kotaku', url: 'https://kotaku.com/rss' },
  { name: 'GameSpot', url: 'https://www.gamespot.com/feeds/mashup/' },
  { name: 'Polygon', url: 'https://www.polygon.com/rss/index.xml' },
  { name: 'Eurogamer', url: 'https://www.eurogamer.net/?format=rss' },
  { name: 'Rock Paper Shotgun', url: 'https://feeds.feedburner.com/RockPaperShotgun' },
]

interface ParsedArticle {
  title: string
  url: string
  source: string
  sourceUrl: string
  description: string | null
  imageUrl: string | null
  publishedAt: Date
}

function extractImage(item: Record<string, unknown>): string | null {
  const enclosure = item.enclosure as { url?: string } | undefined
  if (enclosure?.url) return enclosure.url
  const media = item['media:content'] as { $?: { url?: string } } | undefined
  if (media?.$?.url) return media.$.url
  const content = typeof item.content === 'string' ? item.content : ''
  const match = content.match(/src="([^"]+\.(jpg|jpeg|png|webp))"/i)
  return match ? match[1] : null
}

export async function fetchRSSSource(
  source: { name: string; url: string },
): Promise<ParsedArticle[]> {
  try {
    const feed = await parser.parseURL(source.url)
    return feed.items
      .filter((item) => item.link && item.title)
      .map((item) => ({
        title: item.title!.trim(),
        url: item.link!,
        source: source.name,
        sourceUrl: source.url,
        description: item.contentSnippet?.slice(0, 500) ?? null,
        imageUrl: extractImage(item as Record<string, unknown>),
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      }))
      .filter((a) => {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return a.publishedAt >= sevenDaysAgo
      })
  } catch (err) {
    console.error(`RSS fetch failed for ${source.name}:`, err)
    return []
  }
}

export async function matchArticleToGame(title: string): Promise<string | null> {
  const games = await db.game.findMany({ select: { id: true, title: true } })
  const titleLower = title.toLowerCase()

  for (const game of games) {
    const gameTitleLower = game.title.toLowerCase()
    if (gameTitleLower.length >= 4 && titleLower.includes(gameTitleLower)) {
      return game.id
    }
  }
  return null
}

export async function upsertArticle(article: ParsedArticle): Promise<void> {
  const gameId = await matchArticleToGame(article.title)
  await db.newsArticle.upsert({
    where: { url: article.url },
    create: { ...article, gameId },
    update: {
      title: article.title,
      description: article.description,
      imageUrl: article.imageUrl,
      gameId,
    },
  })
}
