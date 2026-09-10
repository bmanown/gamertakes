import { describe, it, expect, vi } from 'vitest'

vi.mock('@/jobs/syncOpenCritic', () => ({
  syncOpenCriticScores: vi.fn(async () => ({ synced: 1 })),
}))

vi.mock('@/jobs/refreshIGDB', () => ({
  refreshIGDBMetadata: vi.fn(async () => ({ refreshed: 1 })),
}))

vi.mock('@/jobs/computePopular', () => ({
  computePopularGames: vi.fn(async () => ({ updated: 1 })),
}))

import { GET as computePopular } from '../app/api/cron/compute-popular/route'
import { GET as syncOpenCritic } from '../app/api/cron/sync-opencritic/route'
import { GET as refreshIgdb } from '../app/api/cron/refresh-igdb/route'

const CRON_SECRET = 'test-cron-secret'
process.env.CRON_SECRET = CRON_SECRET

function request(auth?: string) {
  return new Request('http://localhost/api/cron', {
    headers: auth ? { Authorization: auth } : undefined,
  })
}

describe('cron routes', () => {
  it('rejects requests without the CRON_SECRET bearer token', async () => {
    const res = await computePopular(request())
    expect(res.status).toBe(401)
  })

  it('runs compute-popular when authorized', async () => {
    const res = await computePopular(request(`Bearer ${CRON_SECRET}`))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ updated: 1 })
  })

  it('runs sync-opencritic and refresh-igdb when authorized', async () => {
    const oc = await syncOpenCritic(request(`Bearer ${CRON_SECRET}`))
    const igdb = await refreshIgdb(request(`Bearer ${CRON_SECRET}`))
    expect(oc.status).toBe(200)
    expect(igdb.status).toBe(200)
    await expect(oc.json()).resolves.toEqual({ synced: 1 })
    await expect(igdb.json()).resolves.toEqual({ refreshed: 1 })
  })
})
