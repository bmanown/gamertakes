'use client'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import { GameCard } from '@/components/game/GameCard'
import { OfficialFilterChips } from '@/components/game/OfficialFilterChips'
import { popularHref } from '@/lib/catalog-url'

function PopularGamesInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const officialOnly = searchParams.get('official') !== '0'
  const { data: popular, isLoading } = trpc.games.getPopular.useQuery({
    limit: 12,
    official: officialOnly,
  })

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Popular Games</h2>
        <OfficialFilterChips
          officialOnly={officialOnly}
          onChange={(next) => router.replace(popularHref(next), { scroll: false })}
        />
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
            <GameCard key={game.id} game={game as never} />
          ))}
        </div>
      )}
    </section>
  )
}

export function PopularGames() {
  return (
    <Suspense
      fallback={
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Games</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        </section>
      }
    >
      <PopularGamesInner />
    </Suspense>
  )
}
