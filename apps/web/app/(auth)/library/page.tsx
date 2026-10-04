'use client'
import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { useSession } from 'next-auth/react'
import { GameCard } from '@/components/game/GameCard'

const STATUS_TABS = [
  { value: undefined, label: 'All' },
  { value: 'PLAYING', label: 'Playing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'WANT_TO_PLAY', label: 'Want to Play' },
  { value: 'DROPPED', label: 'Dropped' },
  { value: 'SHELVED', label: 'Shelved' },
] as const

export default function LibraryPage() {
  const { data: session } = useSession()
  const [activeStatus, setActiveStatus] = useState<string | undefined>(undefined)

  const { data, isLoading } = trpc.library.getLibrary.useQuery(
    { userId: session?.user?.id ?? '', status: activeStatus as any },
    { enabled: !!session?.user?.id }
  )
  const entries = data as Array<{ id: string; game: never }> | undefined

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Library</h1>

      {/* Status tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveStatus(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeStatus === tab.value
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : entries?.length === 0 ? (
        <p className="text-gray-400 text-center py-20">No games here yet. Start adding some!</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {entries?.map((entry) => (
            <GameCard key={entry.id} game={entry.game as never} entry={entry as never} />
          ))}
        </div>
      )}
    </div>
  )
}
