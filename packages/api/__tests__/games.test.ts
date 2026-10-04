import { describe, it, expect, vi } from 'vitest'

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    game: { findMany: vi.fn() },
  },
}))

vi.mock('@gamertakes/db', () => ({ db: mockDb }))

import { createCallerFactory } from '../trpc'
import { gamesRouter } from '../routers/games'
import { officialGameWhere } from '../lib/official'

describe('games.getPopular', () => {
  it('defaults to official releases', async () => {
    mockDb.game.findMany.mockResolvedValue([])
    const caller = createCallerFactory(gamesRouter)({ session: null, db: mockDb as never })
    await caller.getPopular({ limit: 12 })
    expect(mockDb.game.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: officialGameWhere(),
        take: 12,
      }),
    )
  })
})
