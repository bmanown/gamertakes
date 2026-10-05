'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc'
import { GameCard } from '@/components/game/GameCard'
import { OfficialFilterChips } from '@/components/game/OfficialFilterChips'
import { browseGamesHref } from '@/lib/catalog-url'

function BrowsePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlQuery = searchParams.get('q') ?? ''
  const officialOnly = searchParams.get('official') !== '0'
  const [query, setQuery] = useState(urlQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(urlQuery)

  useEffect(() => {
    if (urlQuery === debouncedQuery) return
    setQuery(urlQuery)
    setDebouncedQuery(urlQuery)
  }, [urlQuery, debouncedQuery])

  useEffect(() => {
    const href = browseGamesHref(debouncedQuery, officialOnly)
    const current = browseGamesHref(urlQuery, officialOnly)
    if (href !== current) router.replace(href, { scroll: false })
  }, [debouncedQuery, officialOnly, router, urlQuery])

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
        <OfficialFilterChips
          officialOnly={officialOnly}
          onChange={(next) => router.replace(browseGamesHref(debouncedQuery, next), { scroll: false })}
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
