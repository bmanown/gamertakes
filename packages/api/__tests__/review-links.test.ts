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
    vi.stubEnv('OPENCRITIC_API_KEY', 'oc-key')
    vi.unstubAllEnvs()
    vi.stubEnv('OPENCRITIC_API_KEY', 'oc-key')
    global.fetch = vi.fn()
  })

  it('stores mapped OpenCritic reviews on the game', async () => {
    count.mockResolvedValue(0)
    update.mockResolvedValue({})
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => [{
        title: 'Hades Review',
        externalUrl: 'https://www.ign.com/articles/hades-review',
        Outlet: { name: 'IGN' },
      }],
    } as Response)

    await fetchAndCacheReviewLinks('game-1', 'Hades', 42)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/review/game/42'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-RapidAPI-Key': 'oc-key' }),
      }),
    )
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'game-1' },
        data: expect.objectContaining({
          reviewLinks: [{
            source: 'IGN',
            title: 'Hades Review',
            url: 'https://www.ign.com/articles/hades-review',
          }],
        }),
      }),
    )
  })

  it('searches OpenCritic when the game has no OpenCritic id', async () => {
    count.mockResolvedValue(0)
    update.mockResolvedValue({})
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 42, name: 'Hades' }],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{
          title: 'Hades Review',
          externalUrl: 'https://www.gamespot.com/reviews/hades',
          outlet: { name: 'GameSpot' },
        }],
      } as Response)

    await fetchAndCacheReviewLinks('game-1', 'Hades', null)

    expect(vi.mocked(global.fetch).mock.calls[0][0]).toContain('/game/search?criteria=Hades')
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reviewLinks: [{
            source: 'GameSpot',
            title: 'Hades Review',
            url: 'https://www.gamespot.com/reviews/hades',
          }],
        }),
      }),
    )
  })

  it('skips OpenCritic when the daily quota is already used', async () => {
    count.mockResolvedValue(25)
    await fetchAndCacheReviewLinks('game-1', 'Hades', 42)
    expect(global.fetch).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it('swallows OpenCritic failures', async () => {
    count.mockResolvedValue(0)
    vi.mocked(global.fetch).mockRejectedValue(new Error('network'))
    await expect(fetchAndCacheReviewLinks('game-1', 'Hades', 42)).resolves.toBeUndefined()
  })
})
