'use client'
import { trpc } from '@/lib/trpc'
import { ActivityItem } from '@/components/social/ActivityItem'
import { GameCard } from '@/components/game/GameCard'
import { useSession } from 'next-auth/react'

type FeedActivity = {
  id: string
  type: string
  createdAt: Date
  metadata: unknown
  user: { username: string; displayName: string | null; avatarUrl: string | null }
  game: { slug: string; title: string; coverImage: string | null } | null
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const feedQuery = trpc.social.getFeed.useQuery({ limit: 20 })
  const feedLoading = feedQuery.isLoading
  const activities = ((feedQuery.data as { activities?: FeedActivity[] } | undefined)?.activities ?? [])
  const libraryQuery = trpc.library.getLibrary.useQuery(
    { userId: session?.user?.id ?? '', status: 'PLAYING' },
    { enabled: !!session?.user?.id }
  )
  const playing = libraryQuery.data as Array<{ id: string; game: never; status: string }> | undefined

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        {/* Friend feed */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Friend Activity</h2>
          <div className="rounded-xl border border-gray-100 bg-white">
            {feedLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <p className="p-6 text-sm text-gray-400 text-center">
                Follow some users to see their activity here.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {activities.map((a) => (
                  <ActivityItem key={a.id} activity={a} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: currently playing */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Currently Playing</h2>
          <div className="space-y-3">
            {playing?.slice(0, 5).map((entry) => (
              <GameCard key={entry.id} game={entry.game as never} entry={entry as never} />
            ))}
            {!playing?.length && (
              <p className="text-sm text-gray-400">Nothing in progress. Start a game!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
