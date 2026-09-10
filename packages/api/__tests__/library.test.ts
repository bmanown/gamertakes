import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    gameEntry: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    activity: { create: vi.fn() },
  },
}))

vi.mock('@gamertakes/db', () => ({ db: mockDb }))

import { libraryRouter } from '../routers/library'
import { createCallerFactory } from '../trpc'

const createCaller = createCallerFactory(libraryRouter)

describe('library.addOrUpdate', () => {
  it('upserts a game entry and creates activity', async () => {
    const mockEntry = { id: 'entry1', userId: 'user1', gameId: 'game1', status: 'PLAYING', rating: null }
    mockDb.gameEntry.upsert.mockResolvedValue(mockEntry)
    mockDb.activity.create.mockResolvedValue({})

    const caller = createCaller({
      session: { user: { id: 'user1', username: 'testuser' }, expires: '' },
      db: mockDb as any,
    })

    const result = await caller.addOrUpdate({ gameId: 'game1', status: 'PLAYING' })
    expect(result.status).toBe('PLAYING')
    expect(mockDb.gameEntry.upsert).toHaveBeenCalledOnce()
    expect(mockDb.activity.create).toHaveBeenCalledOnce()
  })

  it('throws UNAUTHORIZED without session', async () => {
    const caller = createCaller({ session: null, db: mockDb as any })
    await expect(caller.addOrUpdate({ gameId: 'game1', status: 'PLAYING' })).rejects.toThrow('UNAUTHORIZED')
  })

  it('throws on invalid rating (0 is out of range)', async () => {
    const caller = createCaller({
      session: { user: { id: 'user1', username: 'testuser' }, expires: '' },
      db: mockDb as any,
    })
    await expect(caller.addOrUpdate({ gameId: 'game1', status: 'PLAYING', rating: 0 })).rejects.toThrow()
  })
})
