import { db } from '@gamertakes/db'
import type { ReviewLink } from '@gamertakes/types'

export const REVIEW_LINKS_DAILY_LIMIT = 95

export function uncachedReviewLinksQuery() {
  return {
    where: { reviewLinksFetchedAt: null },
    orderBy: { popularityScore: 'desc' as const },
    take: REVIEW_LINKS_DAILY_LIMIT,
    select: { id: true, title: true },
  }
}

export function reviewLinkSource(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function asReviewLinks(value: unknown): ReviewLink[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is ReviewLink => {
    return Boolean(
      item
      && typeof item === 'object'
      && typeof (item as ReviewLink).source === 'string'
      && typeof (item as ReviewLink).title === 'string'
      && typeof (item as ReviewLink).url === 'string',
    )
  })
}

function startOfTodayUtc() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

export async function fetchAndCacheReviewLinks(gameId: string, gameName: string) {
  try {
    const key = process.env.GOOGLE_CSE_API_KEY
    const cx = process.env.GOOGLE_CSE_ID
    if (!key || !cx) return

    const usedToday = await db.game.count({
      where: { reviewLinksFetchedAt: { gte: startOfTodayUtc() } },
    })
    if (usedToday >= REVIEW_LINKS_DAILY_LIMIT) return

    const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(key)}&cx=${encodeURIComponent(cx)}&q=${encodeURIComponent(`${gameName} review`)}&num=6`
    const res = await fetch(url)
    if (!res.ok) return
    const data = await res.json() as { items?: { title?: string; link?: string }[] }
    const reviewLinks = (data.items ?? [])
      .filter((item) => item.title && item.link)
      .map((item) => ({
        source: reviewLinkSource(item.link!),
        title: item.title!,
        url: item.link!,
      }))

    await db.game.update({
      where: { id: gameId },
      data: { reviewLinks, reviewLinksFetchedAt: new Date() },
    })
  } catch (err) {
    console.error('review links fetch failed', err)
  }
}
