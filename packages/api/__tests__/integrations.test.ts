import { describe, it, expect, vi } from 'vitest'

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    game: {
      findFirst: vi.fn(),
    },
    gameEntry: {
      upsert: vi.fn(),
    },
  },
}))

vi.mock('@gamertakes/db', () => ({ db: mockDb }))

vi.mock('../lib/steam', () => ({
  fetchSteamLibrary: vi.fn(),
  resolveSteamVanityUrl: vi.fn(),
}))

vi.mock('../lib/igdb', () => ({
  searchIGDB: vi.fn(),
  upsertGameFromIGDB: vi.fn(),
}))

import { createCallerFactory } from '../trpc'
import { integrationsRouter } from '../routers/integrations'
import { fetchSteamLibrary, resolveSteamVanityUrl } from '../lib/steam'

const createCaller = createCallerFactory(integrationsRouter)
const session = { user: { id: 'user1', username: 'testuser' }, expires: '' }

describe('integrations.getIntegrationStatus', () => {
  it('reports which platforms are connected', async () => {
    mockDb.user.findUnique.mockResolvedValue({ steamId: '123', psnId: null })
    const caller = createCaller({ session, db: mockDb as never })
    await expect(caller.getIntegrationStatus()).resolves.toEqual({ steam: true, psn: false })
  })
})

describe('integrations.syncSteam', () => {
  it('throws BAD_REQUEST when Steam is not connected', async () => {
    mockDb.user.findUnique.mockResolvedValue({ steamId: null })
    const caller = createCaller({ session, db: mockDb as never })
    await expect(caller.syncSteam()).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })
})

describe('integrations.connectSteam', () => {
  it('stores a numeric Steam ID and syncs matching games', async () => {
    vi.mocked(fetchSteamLibrary).mockResolvedValue([
      { appid: 1, name: 'Hades', playtime_forever: 90, rtime_last_played: 0 },
    ])
    mockDb.user.update.mockResolvedValue({})
    mockDb.game.findFirst.mockResolvedValue({ id: 'game1', title: 'Hades' })
    mockDb.gameEntry.upsert.mockResolvedValue({})

    const caller = createCaller({ session, db: mockDb as never })
    const result = await caller.connectSteam({ steamInput: '76561198000000000' })
    expect(resolveSteamVanityUrl).not.toHaveBeenCalled()
    expect(mockDb.user.update).toHaveBeenCalledWith({
      where: { id: 'user1' },
      data: { steamId: '76561198000000000' },
    })
    expect(result).toEqual({ updated: 1 })
  })
})
