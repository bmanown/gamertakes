import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockDb, fetchIGDBGame } = vi.hoisted(() => ({
  mockDb: {
    game: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
  },
  fetchIGDBGame: vi.fn(),
}))

vi.mock('@gamertakes/db', () => ({ db: mockDb }))
vi.mock('../lib/igdb', () => ({ fetchIGDBGame }))

import { fillCriticScore, matchAndSyncOpenCritic } from '../lib/opencritic'

const game = {
  id: 'game1',
  title: 'Hades',
  openCriticId: null,
} as never

describe('matchAndSyncOpenCritic', () => {
  beforeEach(() => {
    mockDb.game.update.mockReset()
    mockDb.game.findUnique.mockReset()
    fetchIGDBGame.mockReset()
  })

  it('does not update when no OpenCritic title matches', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 9, name: 'Something Else', topCriticScore: 90, percentRecommended: 80, tier: 'Mighty' }],
    })
    await matchAndSyncOpenCritic(game)
    expect(mockDb.game.update).not.toHaveBeenCalled()
  })

  it('stores score, percent, and tier for an exact title match', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 42, name: 'Hades', topCriticScore: 93, percentRecommended: 98, tier: 'Mighty' }],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 42, name: 'Hades', topCriticScore: 93, percentRecommended: 98, tier: 'Mighty' }),
      })

    await matchAndSyncOpenCritic(game)
    expect(mockDb.game.update).toHaveBeenCalledWith({
      where: { id: 'game1' },
      data: expect.objectContaining({
        openCriticId: 42,
        openCriticScore: 93,
        openCriticPercent: 98,
        openCriticTier: 'Mighty',
      }),
    })
  })
})

describe('fillCriticScore', () => {
  it('uses IGDB aggregated rating when OpenCritic has no match', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    })
    mockDb.game.findUnique.mockResolvedValue({ id: 'game1', igdbId: 1942, openCriticScore: null })
    fetchIGDBGame.mockResolvedValue({ aggregated_rating: 89.4 })

    await fillCriticScore({ id: 'game1', title: 'Hades', igdbId: 1942, openCriticScore: null } as never)

    expect(mockDb.game.update).toHaveBeenCalledWith({
      where: { id: 'game1' },
      data: expect.objectContaining({ openCriticScore: 89 }),
    })
  })
})
