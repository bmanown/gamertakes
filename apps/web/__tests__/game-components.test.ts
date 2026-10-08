import { describe, it, expect, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Game, GameEntry } from '@gamertakes/db'
import { PlaytimeDisplay } from '../components/game/PlaytimeDisplay'
import { GameCard } from '../components/game/GameCard'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) =>
    createElement('img', { src, alt }),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    createElement('a', { href, ...props }, children),
}))

function game(overrides: Partial<Game> = {}): Game {
  return {
    id: 'game1',
    igdbId: 1,
    slug: 'hades',
    title: 'Hades',
    description: null,
    coverImage: null,
    releaseDate: null,
    platforms: ['PC', 'PlayStation 5', 'Switch', 'Xbox'],
    genres: ['Roguelike'],
    developer: 'Supergiant',
    publisher: 'Supergiant',
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
    popularityScore: 0,
    aggregatedRating: null,
    aggregatedRatingCount: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('PlaytimeDisplay', () => {
  it('renders hours on Steam and PSN', () => {
    const html = renderToStaticMarkup(
      createElement(PlaytimeDisplay, { steamMinutes: 8520, psnMinutes: 480 }),
    )
    expect(html).toContain('142h on Steam')
    expect(html).toContain('8h on PSN')
  })

  it('uses 1h for sixty minutes', () => {
    const html = renderToStaticMarkup(createElement(PlaytimeDisplay, { steamMinutes: 60 }))
    expect(html).toContain('1h on Steam')
    expect(html).not.toContain('1hs')
  })

  it('renders nothing when both playtimes are empty', () => {
    expect(renderToStaticMarkup(createElement(PlaytimeDisplay, {}))).toBe('')
  })
})

describe('GameCard', () => {
  it('links to the game page and shows title, platforms, and no-cover fallback', () => {
    const html = renderToStaticMarkup(createElement(GameCard, { game: game() }))
    expect(html).toContain('/games/hades')
    expect(html).toContain('Hades')
    expect(html).toContain('No Cover')
    expect(html).toContain('PC · PlayStation 5 · Switch')
    expect(html).not.toContain('Xbox')
  })

  it('shows a Playing badge when the user has an entry', () => {
    const entry = { status: 'PLAYING' } as GameEntry
    const html = renderToStaticMarkup(createElement(GameCard, { game: game(), entry }))
    expect(html).toContain('Playing')
  })

  it('marks unofficial IGDB extras on the cover', () => {
    const html = renderToStaticMarkup(createElement(GameCard, { game: game({ isOfficial: false }) }))
    expect(html).toContain('Unofficial')
  })
})
