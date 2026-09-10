import { describe, it, expect, vi } from 'vitest'

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    review: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    reviewLike: {
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
    gameEntry: {
      findUnique: vi.fn(),
    },
    activity: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    list: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    listItem: {
      aggregate: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
      updateMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    follow: {
      upsert: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@gamertakes/db', () => ({ db: mockDb }))

import { createCallerFactory } from '../trpc'
import { reviewsRouter } from '../routers/reviews'
import { listsRouter } from '../routers/lists'
import { usersRouter } from '../routers/users'
import { socialRouter } from '../routers/social'
import { activityRouter } from '../routers/activity'

const session = { user: { id: 'user1', username: 'testuser' }, expires: '' }

describe('reviews.create', () => {
  const caller = createCallerFactory(reviewsRouter)

  it('rejects a review when the game is not in the library', async () => {
    mockDb.gameEntry.findUnique.mockResolvedValue(null)
    await expect(
      caller({ session, db: mockDb as never }).create({
        gameId: 'game1',
        body: 'This game is genuinely excellent.',
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })

  it('rejects a second review for the same entry', async () => {
    mockDb.gameEntry.findUnique.mockResolvedValue({ id: 'entry1', review: { id: 'rev1' } })
    await expect(
      caller({ session, db: mockDb as never }).create({
        gameId: 'game1',
        body: 'This game is genuinely excellent.',
      }),
    ).rejects.toMatchObject({ code: 'CONFLICT' })
  })

  it('creates a review and REVIEWED_GAME activity', async () => {
    mockDb.gameEntry.findUnique.mockResolvedValue({ id: 'entry1', review: null })
    mockDb.review.create.mockResolvedValue({ id: 'rev1', body: 'This game is genuinely excellent.' })
    mockDb.activity.create.mockResolvedValue({})

    const result = await caller({ session, db: mockDb as never }).create({
      gameId: 'game1',
      body: 'This game is genuinely excellent.',
    })
    expect(result.id).toBe('rev1')
    expect(mockDb.activity.create).toHaveBeenCalledWith({
      data: { userId: 'user1', type: 'REVIEWED_GAME', gameId: 'game1', reviewId: 'rev1' },
    })
  })
})

describe('lists', () => {
  const caller = createCallerFactory(listsRouter)

  it('forbids viewing a private list owned by someone else', async () => {
    mockDb.list.findUnique.mockResolvedValue({ id: 'list1', isPublic: false, userId: 'other' })
    await expect(
      caller({ session, db: mockDb as never }).getById({ listId: 'list1' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('creates a list and CREATED_LIST activity', async () => {
    mockDb.list.create.mockResolvedValue({ id: 'list1', title: 'Best RPGs' })
    mockDb.activity.create.mockResolvedValue({})
    const result = await caller({ session, db: mockDb as never }).create({ title: 'Best RPGs' })
    expect(result.title).toBe('Best RPGs')
    expect(mockDb.activity.create).toHaveBeenCalledWith({
      data: { userId: 'user1', type: 'CREATED_LIST', listId: 'list1' },
    })
  })
})

describe('users.getProfile', () => {
  it('throws NOT_FOUND for an unknown username', async () => {
    mockDb.user.findUnique.mockResolvedValue(null)
    const caller = createCallerFactory(usersRouter)({ session: null, db: mockDb as never })
    await expect(caller.getProfile({ username: 'nobody' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    })
  })
})

describe('social.follow', () => {
  const caller = createCallerFactory(socialRouter)

  it('cannot follow yourself', async () => {
    await expect(
      caller({ session, db: mockDb as never }).follow({ userId: 'user1' }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })

  it('upserts a follow and writes FOLLOWED_USER activity', async () => {
    mockDb.follow.upsert.mockResolvedValue({})
    mockDb.activity.create.mockResolvedValue({})
    await caller({ session, db: mockDb as never }).follow({ userId: 'user2' })
    expect(mockDb.follow.upsert).toHaveBeenCalledOnce()
    expect(mockDb.activity.create).toHaveBeenCalledWith({
      data: { userId: 'user1', type: 'FOLLOWED_USER', metadata: { followedUserId: 'user2' } },
    })
  })
})

describe('activity.getUserActivity', () => {
  it('returns a cursor page of activities', async () => {
    mockDb.activity.findMany.mockResolvedValue([{ id: 'a1' }])
    const caller = createCallerFactory(activityRouter)({ session: null, db: mockDb as never })
    const result = await caller.getUserActivity({ userId: 'user1' })
    expect(result.activities).toEqual([{ id: 'a1' }])
    expect(result.nextCursor).toBeUndefined()
  })
})
