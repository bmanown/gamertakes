import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchIGDB, upsertGameFromIGDB } from '../lib/igdb'

describe('searchIGDB', () => {
  it('returns array of games for a valid query', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([{
        id: 1942,
        name: 'The Witcher 3: Wild Hunt',
        slug: 'the-witcher-3-wild-hunt',
        summary: 'An RPG.',
        cover: { url: '//images.igdb.com/igdb/image/upload/t_cover_big/abc.jpg' },
        first_release_date: 1431648000,
        platforms: [{ name: 'PC (Microsoft Windows)' }],
        genres: [{ name: 'Role-playing (RPG)' }],
        involved_companies: [],
        similar_games: [1020],
        screenshots: [],
      }])
    } as any)

    const results = await searchIGDB('witcher 3')
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('The Witcher 3: Wild Hunt')
    expect(results[0].slug).toBe('the-witcher-3-wild-hunt')
  })

  it('returns empty array on empty response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([])
    } as any)

    const results = await searchIGDB('xyznotarealquery')
    expect(results).toEqual([])
  })

  it('asks IGDB for official categories by default', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    } as never)
    await searchIGDB('zelda')
    const body = String((global.fetch as ReturnType<typeof vi.fn>).mock.calls.at(-1)?.[1]?.body ?? '')
    expect(body).toContain('game_type.type = ("Main Game","Remake","Remaster")')
    expect(body).toContain('category = (0,8,9)')
  })
})
