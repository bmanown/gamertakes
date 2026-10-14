import { describe, it, expect, vi, beforeEach } from 'vitest'

const { count, update } = vi.hoisted(() => ({
  count: vi.fn(),
  update: vi.fn(),
}))

vi.mock('@gamertakes/db', () => ({
  db: { game: { count, update } },
}))

import { fetchAndCacheReviewLinks, reviewLinkSource } from '../lib/review-links'

describe('reviewLinkSource', () => {
  it('uses the hostname without www', () => {
    expect(reviewLinkSource('https://www.ign.com/articles/hades-review')).toBe('ign.com')
  })
})

describe('fetchAndCacheReviewLinks', () => {
  beforeEach(() => {
    count.mockReset()
    update.mockReset()
    vi.stubEnv('GOOGLE_CSE_API_KEY', 'key')
    vi.stubEnv('GOOGLE_CSE_ID', 'cx')
    global.fetch = vi.fn()
  })

  it('stores mapped CSE results on the game', async () => {
    count.mockResolvedValue(0)
    update.mockResolvedValue({})
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [{ title: 'Hades Review', link: 'https://www.ign.com/articles/hades-review' }],
      }),
    } as Response)

    await fetchAndCacheReviewLinks('game-1', 'Hades')

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('q=Hades%20review'))
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'game-1' },
        data: expect.objectContaining({
          reviewLinks: [{
            source: 'ign.com',
            title: 'Hades Review',
            url: 'https://www.ign.com/articles/hades-review',
          }],
        }),
      }),
    )
  })

  it('skips CSE when the daily quota is already used', async () => {
    count.mockResolvedValue(95)
    await fetchAndCacheReviewLinks('game-1', 'Hades')
    expect(global.fetch).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it('swallows CSE failures', async () => {
    count.mockResolvedValue(0)
    vi.mocked(global.fetch).mockRejectedValue(new Error('network'))
    await expect(fetchAndCacheReviewLinks('game-1', 'Hades')).resolves.toBeUndefined()
  })
})
