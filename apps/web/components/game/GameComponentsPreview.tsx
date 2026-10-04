'use client'
import { useState } from 'react'
import { GameCard } from '@/components/game/GameCard'
import { StatusPicker } from '@/components/game/StatusPicker'
import { PlaytimeDisplay } from '@/components/game/PlaytimeDisplay'
import type { Game, GameEntry } from '@gamertakes/db'

const sampleGame = {
  id: 'preview-1',
  igdbId: 1,
  slug: 'hades',
  title: 'Hades',
  description: null,
  coverImage: null,
  releaseDate: null,
  platforms: ['PC', 'PlayStation 5', 'Switch'],
  genres: ['Roguelike'],
  developer: 'Supergiant',
  publisher: 'Supergiant',
  openCriticId: null,
  openCriticScore: 93,
  openCriticPercent: 98,
  openCriticTier: 'Mighty',
  openCriticLastSync: null,
  igdbCategory: 0,
  isOfficial: true,
  igdbLastSync: new Date(),
  similarGames: [],
  screenshots: [],
  popularityScore: 12,
  createdAt: new Date(),
  updatedAt: new Date(),
  communityRating: 4.6,
  totalRatings: 128,
} as Game & { communityRating: number; totalRatings: number }

const sampleEntry = { status: 'PLAYING' } as GameEntry

export function GameComponentsPreview() {
  const [status, setStatus] = useState<'PLAYING' | 'COMPLETED' | 'WANT_TO_PLAY' | 'DROPPED' | 'SHELVED' | null>('PLAYING')

  return (
    <section className="mt-16 border-t border-gray-200 pt-10">
      <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500">Game components</h2>
      <div className="mt-6 grid max-w-xs gap-6">
        <GameCard game={sampleGame} entry={sampleEntry} />
        <StatusPicker value={status} onChange={setStatus} />
        <PlaytimeDisplay steamMinutes={8520} psnMinutes={480} />
      </div>
    </section>
  )
}
