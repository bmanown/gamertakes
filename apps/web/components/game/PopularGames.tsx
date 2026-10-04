'use client'
import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { GameCard } from '@/components/game/GameCard'
import { OfficialFilterChips } from '@/components/game/OfficialFilterChips'

export function PopularGames() {
  const [officialOnly, setOfficialOnly] = useState(true)
  const { data: popular, isLoading } = trpc.games.getPopular.useQuery({
    limit: 12,
    official: officialOnly,
  })

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Popular Games</h2>
        <OfficialFilterChips officialOnly={officialOnly} onChange={setOfficialOnly} />
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {popular?.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </section>
  )
}
