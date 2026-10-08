import { describe, it, expect, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Game, GameEntry } from '@gamertakes/db'
import { browseGamesHref, popularHref } from '../lib/catalog-url'

const { getPopular, searchQuery, getLibrary } = vi.hoisted(() => ({
  getPopular: vi.fn(),
  searchQuery: vi.fn(),
  getLibrary: vi.fn(),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) =>
    createElement('img', { src, alt }),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    createElement('a', { href, ...props }, children),
}))

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/',
}))

vi.mock('@/lib/trpc', () => ({
  trpc: {
    games: {
      search: { useQuery: searchQuery },
      getPopular: { useQuery: getPopular },
    },
    library: { getLibrary: { useQuery: getLibrary } },
  },
}))

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'user-1' } } }),
}))

function game(overrides: Partial<Game> = {}): Game {
  return {
    id: 'game1',
    igdbId: 1,
    slug: 'celeste',
    title: 'Celeste',
    description: null,
    coverImage: null,
    releaseDate: null,
    platforms: ['Switch', 'PC'],
    genres: ['Platformer'],
    developer: 'Maddy Makes Games',
    publisher: 'Maddy Makes Games',
    openCriticId: null,
    openCriticScore: null,
    openCriticPercent: null,
    openCriticTier: null,
    openCriticLastSync: null,
    igdbLastSync: new Date(),
    similarGames: [],
    screenshots: [],
    igdbCategory: 0,
    isOfficial: true,
    popularityScore: 10,
    aggregatedRating: null,
    aggregatedRatingCount: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('LandingPage', () => {
  it('renders the hero and popular games', async () => {
    getPopular.mockReturnValue({ data: [game()], isLoading: false })
    const { default: LandingPage } = await import('../app/(public)/page')
    const html = renderToStaticMarkup(createElement(LandingPage))
    expect(html).toContain('Track every game you play.')
    expect(html).toContain('Popular Games')
    expect(html).toContain('Celeste')
    expect(html).toContain('Official releases')
    expect(html).toContain('All games')
    expect(html).toContain('/auth/signup')
    expect(html).toContain('/games')
  })
})

describe('catalog urls', () => {
  it('keeps browse search and unofficial filter in the address bar', () => {
    expect(browseGamesHref('zelda')).toBe('/games?q=zelda')
    expect(browseGamesHref('zelda', false)).toBe('/games?q=zelda&official=0')
    expect(browseGamesHref('', true)).toBe('/games')
    expect(popularHref(true)).toBe('/')
    expect(popularHref(false)).toBe('/?official=0')
  })
})

describe('BrowsePage', () => {
  it('renders the search field and game results', async () => {
    searchQuery.mockReturnValue({ data: [game()], isLoading: false })
    const { default: BrowsePage } = await import('../app/(public)/games/page')
    const html = renderToStaticMarkup(createElement(BrowsePage))
    expect(html).toContain('Browse Games')
    expect(html).toContain('Search games...')
    expect(html).toContain('Celeste')
    expect(html).toContain('Official releases')
    expect(html).toContain('All games')
  })
})

describe('LibraryPage', () => {
  it('shows status tabs and an empty shelf message', async () => {
    getLibrary.mockReturnValue({ data: [], isLoading: false })
    const { default: LibraryPage } = await import('../app/(auth)/library/page')
    const html = renderToStaticMarkup(createElement(LibraryPage))
    expect(html).toContain('My Library')
    expect(html).toContain('All')
    expect(html).toContain('Playing')
    expect(html).toContain('No games here yet. Start adding some!')
  })

  it('renders library entries as game cards', async () => {
    const entry = { id: 'e1', status: 'PLAYING', game: game() } as GameEntry & { game: Game }
    getLibrary.mockReturnValue({ data: [entry], isLoading: false })
    const { default: LibraryPage } = await import('../app/(auth)/library/page')
    const html = renderToStaticMarkup(createElement(LibraryPage))
    expect(html).toContain('Celeste')
    expect(html).toContain('Playing')
  })
})
