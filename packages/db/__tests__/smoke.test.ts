import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db } from '../index'

describe('Prisma client', () => {
  it('connects to the database', async () => {
    const result = await db.$queryRaw`SELECT 1 as connected`
    expect(result).toEqual([{ connected: 1 }])
  })

  afterAll(async () => {
    await db.$disconnect()
  })
})
