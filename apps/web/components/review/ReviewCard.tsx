import { formatDistanceToNow } from 'date-fns'
import { StarRating } from '@/components/ui/StarRating'
import { Button } from '@/components/ui/Button'
import { HeartIcon } from 'lucide-react'

interface ReviewCardProps {
  review: {
    id: string
    body: string
    containsSpoilers: boolean
    createdAt: Date | string
    user: { username: string; displayName: string | null; avatarUrl: string | null }
    entry: { rating: number | null }
    likes: { userId: string }[]
  }
  currentUserId?: string
  onLike?: (reviewId: string) => void
}

export function ReviewCard({ review, currentUserId, onLike }: ReviewCardProps) {
  const liked = review.likes.some((l) => l.userId === currentUserId)
  const likeCount = review.likes.length

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
            {review.user.avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={review.user.avatarUrl} alt={review.user.username} className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">{review.user.displayName ?? review.user.username}</p>
            <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(review.createdAt))} ago</p>
          </div>
        </div>
        {review.entry.rating && <StarRating value={review.entry.rating} readonly size="sm" />}
      </div>

      {review.containsSpoilers ? (
        <details className="text-sm text-gray-600">
          <summary className="cursor-pointer text-amber-600 font-medium">Spoilers — click to reveal</summary>
          <p className="mt-2 whitespace-pre-wrap">{review.body}</p>
        </details>
      ) : (
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.body}</p>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLike?.(review.id)}
          className={liked ? 'text-red-500' : 'text-gray-400'}
        >
          <HeartIcon className="h-4 w-4 mr-1" fill={liked ? 'currentColor' : 'none'} />
          {likeCount}
        </Button>
      </div>
    </div>
  )
}
