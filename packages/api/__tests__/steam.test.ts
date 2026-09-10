import { describe, it, expect, vi } from 'vitest'
import { fetchSteamLibrary, resolveSteamVanityUrl } from '../lib/steam'

describe('fetchSteamLibrary', () => {
  it('returns owned games from the Steam API', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        response: {
          games: [
            { appid: 292030, name: 'The Witcher 3: Wild Hunt', playtime_forever: 120, rtime_last_played: 0 },
          ],
        },
      }),
    })

    const games = await fetchSteamLibrary('76561198000000000')
    expect(games).toHaveLength(1)
    expect(games[0].appid).toBe(292030)
    expect(games[0].playtime_forever).toBe(120)
  })

  it('returns an empty array when Steam sends no games', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ response: {} }),
    })
    await expect(fetchSteamLibrary('76561198000000000')).resolves.toEqual([])
  })
})

describe('resolveSteamVanityUrl', () => {
  it('returns the steamid when resolution succeeds', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ response: { success: 1, steamid: '76561198000000000' } }),
    })
    await expect(resolveSteamVanityUrl('gamer')).resolves.toBe('76561198000000000')
  })

  it('throws when the vanity URL cannot be resolved', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ response: { success: 42 } }),
    })
    await expect(resolveSteamVanityUrl('nope')).rejects.toThrow('Steam vanity URL not found')
  })
})
