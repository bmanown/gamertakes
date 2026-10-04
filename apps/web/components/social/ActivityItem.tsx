import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

const ACTIVITY_TEMPLATES: Record<string, (meta: any) => string> = {
  ADDED_GAME: (m) => `added this game as ${m?.status?.replace(/_/g, ' ').toLowerCase()}`,
  UPDATED_STATUS: (m) => `is now ${m?.status?.replace(/_/g, ' ').toLowerCase()}`,
  RATED_GAME: (m) => `rated this ${m?.rating} star${m?.rating !== 1 ? 's' : ''}`,
  REVIEWED_GAME: () => 'wrote a review',
  CREATED_LIST: () => 'created a new list',
  FOLLOWED_USER: () => 'is following someone new',
}

interface ActivityItemProps {
  activity: {
    id: string
    type: string
    createdAt: Date
    metadata: any
    user: { username: string; displayName: string | null; avatarUrl: string | null }
    game: { slug: string; title: string; coverImage: string | null } | null
  }
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const template = ACTIVITY_TEMPLATES[activity.type]
  const description = template?.(activity.metadata) ?? activity.type.toLowerCase()

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="h-8 w-8 rounded-full bg-gray-200 shrink-0 overflow-hidden">
        {activity.user.avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={activity.user.avatarUrl} alt={activity.user.username} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <Link href={`/users/${activity.user.username}`} className="font-medium hover:text-brand-600">
            {activity.user.displayName ?? activity.user.username}
          </Link>{' '}
          {description}
          {activity.game && (
            <>
              {' '}
              <Link href={`/games/${activity.game.slug}`} className="font-medium hover:text-brand-600">
                {activity.game.title}
              </Link>
            </>
          )}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatDistanceToNow(new Date(activity.createdAt))} ago
        </p>
      </div>
      {activity.game?.coverImage && (
        <div className="h-10 w-8 rounded overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={activity.game.coverImage} alt="" className="h-full w-full object-cover" />
        </div>
      )}
    </div>
  )
}
