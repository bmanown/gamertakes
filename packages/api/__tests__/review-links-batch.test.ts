import { describe, it, expect } from 'vitest'
import { REVIEW_LINKS_DAILY_LIMIT, uncachedReviewLinksQuery } from '../lib/review-links'

describe('uncachedReviewLinksQuery', () => {
  it('picks the most popular games that have never been fetched', () => {
    expect(uncachedReviewLinksQuery()).toEqual({
      where: { reviewLinksFetchedAt: null },
      orderBy: { popularityScore: 'desc' },
      take: REVIEW_LINKS_DAILY_LIMIT,
      select: { id: true, title: true, openCriticId: true },
    })
    expect(REVIEW_LINKS_DAILY_LIMIT).toBe(25)
  })
})
