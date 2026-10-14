'use client'
import { useState } from 'react'
import { GameCard, type GameCardGame } from '@/components/game/GameCard'
import { StatusPicker } from '@/components/game/StatusPicker'
import { PlaytimeDisplay } from '@/components/game/PlaytimeDisplay'

const sampleGame: GameCardGame = {
  id: 'preview-1',
  slug: 'hades',
  title: 'Hades',
  coverImage: null,
  platforms: ['PC', 'PlayStation 5', 'Switch'],
  isOfficial: true,
  communityRating: 4.6,
  totalRatings: 128,
}

const sampleEntry = { status: 'PLAYING' }

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
