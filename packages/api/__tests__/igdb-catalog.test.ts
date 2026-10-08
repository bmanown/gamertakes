import { describe, it, expect } from 'vitest'
import { CATALOG_PAGE_SIZE, CATALOG_TARGET, catalogQuery, catalogWindows } from '../lib/igdb-catalog'

describe('IGDB catalog import query', () => {
  it('asks for official games sorted by follows, 500 at a time', () => {
    const body = catalogQuery({ offset: 500, fromYear: 2010, toYear: 2020 })
    expect(CATALOG_PAGE_SIZE).toBe(500)
    expect(CATALOG_TARGET).toBe(10_000)
    expect(body).toContain('limit 500')
    expect(body).toContain('offset 500')
    expect(body).toContain('sort total_rating_count desc')
    expect(body).toContain('aggregated_rating')
    expect(body).toContain('aggregated_rating_count')
    expect(body).toContain('total_rating_count')
    expect(body).toContain('game_type.type = ("Main Game","Remake","Remaster")')
    expect(body).toContain('first_release_date')
  })

  it('covers enough year windows to page past IGDB offset 5000', () => {
    expect(catalogWindows.length).toBeGreaterThanOrEqual(4)
    expect(catalogWindows[0].fromYear).toBeGreaterThan(catalogWindows.at(-1)!.fromYear)
  })
})
