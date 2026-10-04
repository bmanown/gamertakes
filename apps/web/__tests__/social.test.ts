import { describe, it, expect, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const { getProfile, getUserActivity, getFeed, getLibrary, auth, followMutate, unfollowMutate } = vi.hoisted(() => ({
  getProfile: vi.fn(),
  getUserActivity: vi.fn(),
  getFeed: vi.fn(),
  getLibrary: vi.fn(),
  auth: vi.fn(),
  followMutate: vi.fn(),
  unfollowMutate: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    createElement('a', { href, ...props }, children),
}))

vi.mock('date-fns', () => ({
  formatDistanceToNow: () => '2 hours',
}))

vi.mock('@gamertakes/api/trpc', () => ({
  createCallerFactory: () => () => ({
    users: { getProfile },
    activity: { getUserActivity },
  }),
}))

vi.mock('@gamertakes/api', () => ({ appRouter: {} }))
vi.mock('@gamertakes/db', () => ({ db: { user: { findUnique: vi.fn() } } }))
vi.mock('@/lib/auth', () => ({ auth }))

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'user-1' } } }),
}))

vi.mock('@/lib/trpc', () => ({
  trpc: {
    social: {
      getFeed: { useQuery: getFeed },
      follow: { useMutation: () => ({ mutate: followMutate, isPending: false }) },
      unfollow: { useMutation: () => ({ mutate: unfollowMutate, isPending: false }) },
    },
    library: { getLibrary: { useQuery: getLibrary } },
  },
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) =>
    createElement('img', { src, alt }),
}))

function activity(overrides: Record<string, unknown> = {}) {
  return {
    id: 'act1',
    type: 'RATED_GAME',
    createdAt: new Date('2024-01-01'),
    metadata: { rating: 5 },
    user: { username: 'zagreus', displayName: 'Zagreus', avatarUrl: null },
    game: { slug: 'hades', title: 'Hades', coverImage: null },
    ...overrides,
  }
}

describe('ActivityItem', () => {
  it('renders who acted, the rating template, the game link, and relative time', async () => {
    const { ActivityItem } = await import('../components/social/ActivityItem')
    const html = renderToStaticMarkup(createElement(ActivityItem, { activity: activity() }))
    expect(html).toContain('Zagreus')
    expect(html).toContain('/users/zagreus')
    expect(html).toContain('rated this 5 stars')
    expect(html).toContain('Hades')
    expect(html).toContain('/games/hades')
    expect(html).toContain('2 hours ago')
  })

  it('falls back to username and describes a review', async () => {
    const { ActivityItem } = await import('../components/social/ActivityItem')
    const html = renderToStaticMarkup(
      createElement(ActivityItem, {
        activity: activity({
          type: 'REVIEWED_GAME',
          metadata: null,
          user: { username: 'zagreus', displayName: null, avatarUrl: null },
        }),
      }),
    )
    expect(html).toContain('zagreus')
    expect(html).toContain('wrote a review')
  })
})

describe('FollowButton', () => {
  it('shows Follow when the viewer is not following', async () => {
    const { FollowButton } = await import('../components/social/FollowButton')
    const html = renderToStaticMarkup(createElement(FollowButton, { userId: 'u2' }))
    expect(html).toContain('Follow')
    expect(html).not.toContain('Following')
  })
})

describe('UserProfilePage', () => {
  it('renders profile stats and an empty activity state', async () => {
    auth.mockResolvedValue(null)
    getProfile.mockResolvedValue({
      id: 'u1',
      username: 'zagreus',
      displayName: 'Zagreus',
      avatarUrl: null,
      bio: 'Escape the House.',
      _count: { entries: 12, reviews: 3, followers: 8, following: 2 },
    })
    getUserActivity.mockResolvedValue({ activities: [] })
    const { default: UserProfilePage } = await import('../app/(public)/users/[username]/page')
    const html = renderToStaticMarkup(await UserProfilePage({ params: { username: 'zagreus' } }))
    expect(html).toContain('Zagreus')
    expect(html).toContain('@zagreus')
    expect(html).toContain('Escape the House.')
    expect(html).toContain('12')
    expect(html).toContain('games')
    expect(html).toContain('No activity yet.')
  })
})

describe('DashboardPage', () => {
  it('renders empty feed and currently-playing copy', async () => {
    getFeed.mockReturnValue({ data: { activities: [] }, isLoading: false })
    getLibrary.mockReturnValue({ data: [] })
    const { default: DashboardPage } = await import('../app/(auth)/dashboard/page')
    const html = renderToStaticMarkup(createElement(DashboardPage))
    expect(html).toContain('Dashboard')
    expect(html).toContain('Friend Activity')
    expect(html).toContain('Follow some users to see their activity here.')
    expect(html).toContain('Currently Playing')
    expect(html).toContain('Nothing in progress. Start a game!')
  })
})
