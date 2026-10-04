import Image from 'next/image'
import Link from 'next/link'
import { StarRating } from '@/components/ui/StarRating'
import { clsx } from 'clsx'
import type { Game, GameEntry } from '@gamertakes/db'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PLAYING: { label: 'Playing', color: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  WANT_TO_PLAY: { label: 'Want to Play', color: 'bg-purple-100 text-purple-800' },
  DROPPED: { label: 'Dropped', color: 'bg-red-100 text-red-800' },
  SHELVED: { label: 'Shelved', color: 'bg-gray-100 text-gray-800' },
}

interface GameCardProps {
  game: Game & { communityRating?: number | null; totalRatings?: number }
  entry?: GameEntry | null
}

export function GameCard({ game, entry }: GameCardProps) {
  const status = entry?.status ? STATUS_LABELS[entry.status] : null

  return (
    <Link href={`/games/${game.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-xl bg-gray-100 aspect-[3/4]">
        {game.coverImage ? (
          <Image
            src={game.coverImage}
            alt={game.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">No Cover</div>
        )}
        {status && (
          <span className={clsx('absolute top-2 left-2 rounded-md px-2 py-0.5 text-xs font-medium', status.color)}>
            {status.label}
          </span>
        )}
      </div>
      <div className="mt-2 space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-600">
          {game.title}
        </h3>
        {game.communityRating !== null && game.communityRating !== undefined && (
          <div className="flex items-center gap-1">
            <StarRating value={Math.round(game.communityRating)} readonly size="sm" />
            <span className="text-xs text-gray-500">({game.totalRatings ?? 0})</span>
          </div>
        )}
        {game.platforms.length > 0 && (
          <p className="text-xs text-gray-400 truncate">{game.platforms.slice(0, 3).join(' · ')}</p>
        )}
      </div>
    </Link>
  )
}
