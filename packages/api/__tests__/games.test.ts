import { describe, it, expect, vi } from 'vitest'

const { mockDb, searchIGDB, upsertGameFromIGDB, gameFromIGDB, cacheIGDBGames } = vi.hoisted(() => {
  const upsertGameFromIGDB = vi.fn(() => new Promise(() => {}))
  return {
    mockDb: {
      game: { findMany: vi.fn() },
    },
    searchIGDB: vi.fn(),
    upsertGameFromIGDB,
    cacheIGDBGames: vi.fn((games: unknown[]) => {
      for (const game of games) void upsertGameFromIGDB(game)
    }),
    gameFromIGDB: vi.fn((game: { id: number; slug: string; name: string }) => ({
      id: `igdb-${game.id}`,
      igdbId: game.id,
      slug: game.slug,
      title: game.name,
      platforms: [],
      isOfficial: true,
    })),
  }
})

vi.mock('@gamertakes/db', () => ({ db: mockDb }))
vi.mock('../lib/igdb', () => ({
  searchIGDB,
  upsertGameFromIGDB,
  gameFromIGDB,
  cacheIGDBGames,
}))

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

describe('games.search', () => {
  it('returns IGDB hits without waiting for the cache write', async () => {
    mockDb.game.findMany.mockResolvedValue([])
    searchIGDB.mockResolvedValue([{ id: 1942, name: 'The Witcher 3: Wild Hunt', slug: 'the-witcher-3-wild-hunt' }])
    const caller = createCallerFactory(gamesRouter)({ session: null, db: mockDb as never })
    const result = await caller.search({ query: 'witcher' })
    expect(result[0]).toMatchObject({ slug: 'the-witcher-3-wild-hunt', title: 'The Witcher 3: Wild Hunt' })
    expect(upsertGameFromIGDB).toHaveBeenCalled()
  })
})
