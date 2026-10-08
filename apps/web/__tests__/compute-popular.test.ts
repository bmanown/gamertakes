import { describe, it, expect, vi } from 'vitest'
import { recentActivityWhere } from '../../jobs/popularity'

describe('recentActivityWhere', () => {
  it('only selects games with recent library or review activity', () => {
    const since = new Date('2026-09-01')
    expect(recentActivityWhere(since)).toEqual({
      OR: [
        { entries: { some: { updatedAt: { gte: since } } } },
        { reviews: { some: { createdAt: { gte: since } } } },
      ],
    })
  })
})
