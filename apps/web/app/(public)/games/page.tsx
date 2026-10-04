'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import { GameCard } from '@/components/game/GameCard'
import { OfficialFilterChips } from '@/components/game/OfficialFilterChips'

function BrowsePageInner() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [officialOnly, setOfficialOnly] = useState(true)

  const { data, isLoading } = trpc.games.search.useQuery(
    { query: debouncedQuery || 'zelda', official: officialOnly },
    { enabled: true }
  )
  const games = data as Array<{ id: string }> | undefined

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Games</h1>
      <input
        type="search"
        placeholder="Search games..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          clearTimeout((window as any).__searchTimer)
          ;(window as any).__searchTimer = setTimeout(() => setDebouncedQuery(e.target.value), 400)
        }}
        className="w-full max-w-xl rounded-xl border border-gray-200 px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-brand-500"
      />

      <div className="mb-8">
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
          {games?.map((game) => <GameCard key={game.id} game={game as never} />)}
        </div>
      )}
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8 text-sm text-gray-400">Loading games…</div>}>
      <BrowsePageInner />
    </Suspense>
  )
}
