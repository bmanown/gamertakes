import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@gamertakes/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

import { db } from '@gamertakes/db'
import { hashPassword } from '@gamertakes/api/password'
import { authorizeCredentials, jwtCallback, sessionCallback } from '../lib/auth-utils'

const findUnique = vi.mocked(db.user.findUnique)

describe('authorizeCredentials', () => {
  beforeEach(() => {
    findUnique.mockReset()
  })

  it('returns null for invalid credentials', async () => {
    await expect(
      authorizeCredentials({ email: 'not-an-email', password: 'short' }),
    ).resolves.toBeNull()
    expect(findUnique).not.toHaveBeenCalled()
  })

  it('returns null when no user exists for the email', async () => {
    findUnique.mockResolvedValue(null)
    await expect(
      authorizeCredentials({ email: 'brian@example.com', password: 'password1' }),
    ).resolves.toBeNull()
  })

  it('returns null when the password does not match', async () => {
    findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'brian@example.com',
      username: 'brian',
      passwordHash: await hashPassword('password1'),
    } as Awaited<ReturnType<typeof findUnique>>)
    await expect(
      authorizeCredentials({ email: 'brian@example.com', password: 'wrongpass' }),
    ).resolves.toBeNull()
  })

  it('returns the user when email and password match', async () => {
    const user = {
      id: 'user-1',
      email: 'brian@example.com',
      username: 'brian',
      passwordHash: await hashPassword('password1'),
    }
    findUnique.mockResolvedValue(user as Awaited<ReturnType<typeof findUnique>>)
    await expect(
      authorizeCredentials({ email: 'brian@example.com', password: 'password1' }),
    ).resolves.toMatchObject({ id: 'user-1', username: 'brian' })
  })
})

describe('session callbacks', () => {
  it('copies user id and username onto the JWT', () => {
    const token = jwtCallback({
      token: {},
      user: { id: 'user-1', username: 'brian' },
    })
    expect(token).toMatchObject({ id: 'user-1', username: 'brian' })
  })

  it('copies JWT id and username onto the session user', () => {
    const session = sessionCallback({
      session: { user: { email: 'brian@example.com' }, expires: '2099-01-01' } as never,
      token: { id: 'user-1', username: 'brian' },
    })
    expect(session.user.id).toBe('user-1')
    expect(session.user.username).toBe('brian')
  })
})
