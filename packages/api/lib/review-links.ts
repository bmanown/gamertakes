import { db } from '@gamertakes/db'
import type { ReviewLink } from '@gamertakes/types'
import { fetchOpenCriticReviews, searchOpenCritic } from './opencritic'

export const REVIEW_LINKS_DAILY_LIMIT = 25

export function uncachedReviewLinksQuery() {
  return {
    where: { reviewLinksFetchedAt: null },
    orderBy: { popularityScore: 'desc' as const },
    take: REVIEW_LINKS_DAILY_LIMIT,
    select: { id: true, title: true, openCriticId: true },
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

function outletName(review: { Outlet?: { name?: string }; outlet?: { name?: string } }) {
  return review.Outlet?.name || review.outlet?.name || null
}

export function reviewLinksFromOpenCritic(reviews: unknown): ReviewLink[] {
  if (!Array.isArray(reviews)) return []
  return reviews.flatMap((review) => {
    if (!review || typeof review !== 'object') return []
    const item = review as {
      title?: string
      externalUrl?: string
      Outlet?: { name?: string }
      outlet?: { name?: string }
    }
    if (!item.externalUrl) return []
    const source = outletName(item) || reviewLinkSource(item.externalUrl)
    return [{
      source,
      title: item.title || source,
      url: item.externalUrl,
    }]
  }).slice(0, 8)
}

export async function fetchAndCacheReviewLinks(
  gameId: string,
  gameName: string,
  openCriticId?: number | null,
) {
  try {
    if (!process.env.OPENCRITIC_API_KEY) return

    const usedToday = await db.game.count({
      where: { reviewLinksFetchedAt: { gte: startOfTodayUtc() } },
    })
    if (usedToday >= REVIEW_LINKS_DAILY_LIMIT) return

    let ocId = openCriticId ?? null
    if (!ocId) {
      const results = await searchOpenCritic(gameName)
      ocId = results.find((game) => game.name.toLowerCase() === gameName.toLowerCase())?.id ?? null
    }

    const reviewLinks = ocId ? reviewLinksFromOpenCritic(await fetchOpenCriticReviews(ocId)) : []

    await db.game.update({
      where: { id: gameId },
      data: {
        reviewLinks,
        reviewLinksFetchedAt: new Date(),
        ...(ocId ? { openCriticId: ocId } : {}),
      },
    })
  } catch (err) {
    console.error('review links fetch failed', err)
  }
}
