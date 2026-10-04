'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Session } from 'next-auth'
import type { Game, GameEntry, GameStatus } from '@gamertakes/db'
import { StatusPicker } from '@/components/game/StatusPicker'
import { StarRating } from '@/components/ui/StarRating'
import { PlaytimeDisplay } from '@/components/game/PlaytimeDisplay'
import { trpc } from '@/lib/trpc'

interface GameDetailActionsProps {
  game: Game
  userEntry: (GameEntry & { review?: { id: string } | null }) | null
  session: Session | null
}

export function GameDetailActions({ game, userEntry, session }: GameDetailActionsProps) {
  const [status, setStatus] = useState<GameStatus | null>(userEntry?.status ?? null)
  const [rating, setRating] = useState<number | null>(userEntry?.rating ?? null)
  const mutation = trpc.library.addOrUpdate.useMutation()

  if (!session?.user?.id) {
    return (
      <Link
        href="/auth/signin"
        className="flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
      >
        Sign in to add to library
      </Link>
    )
  }

  return (
    <div className="space-y-3">
      <StatusPicker
        value={status}
        onChange={(next) => {
          setStatus(next)
          mutation.mutate({ gameId: game.id, status: next, rating: rating ?? undefined })
        }}
      />
      <StarRating
        value={rating}
        onChange={(next) => {
          setRating(next)
          mutation.mutate({
            gameId: game.id,
            status: status ?? 'WANT_TO_PLAY',
            rating: next,
          })
        }}
      />
      <PlaytimeDisplay steamMinutes={userEntry?.steamMinutes} psnMinutes={userEntry?.psnMinutes} />
    </div>
  )
}
