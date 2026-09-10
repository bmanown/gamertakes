import { describe, it, expect } from 'vitest'
import type { Session } from 'next-auth'
import {
  createCallerFactory,
  createTRPCContext,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '../trpc'

const testRouter = createTRPCRouter({
  public: publicProcedure.query(() => 'ok'),
  secret: protectedProcedure.query(({ ctx }) => ctx.session.user),
})

const createCaller = createCallerFactory(testRouter)

const session = {
  user: { id: 'user-1', email: 'brian@example.com', name: 'Brian' },
  expires: new Date(Date.now() + 86_400_000).toISOString(),
} as Session

describe('createTRPCContext', () => {
  it('attaches the session and db client', async () => {
    const ctx = await createTRPCContext({ session: null })
    expect(ctx.session).toBeNull()
    expect(ctx.db).toBeDefined()
  })
})

describe('protectedProcedure', () => {
  it('throws UNAUTHORIZED when there is no session user', async () => {
    const caller = createCaller(await createTRPCContext({ session: null }))
    await expect(caller.secret()).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })

  it('allows the call when a session user is present', async () => {
    const caller = createCaller(await createTRPCContext({ session }))
    await expect(caller.secret()).resolves.toMatchObject({ id: 'user-1' })
  })
})
