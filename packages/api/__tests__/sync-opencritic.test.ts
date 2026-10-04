import { describe, it, expect } from 'vitest'
import { openCriticSyncQuery } from '../../../jobs/openCriticQuery'

describe('openCriticSyncQuery', () => {
  it('selects unsynced catalog games by popularity, not library activity', () => {
    const query = openCriticSyncQuery(1_700_000_000_000)
    expect(query.orderBy).toEqual({ popularityScore: 'desc' })
    expect(query.take).toBe(200)
    expect(query.where).toEqual({
      OR: [
        { openCriticLastSync: null },
        { openCriticLastSync: { lt: new Date(1_700_000_000_000 - 24 * 60 * 60 * 1000) } },
      ],
    })
    expect(query.where).not.toHaveProperty('entries')
  })
})
