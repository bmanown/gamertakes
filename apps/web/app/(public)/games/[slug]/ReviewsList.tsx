'use client'
import type { Session } from 'next-auth'
import { ReviewCard } from '@/components/review/ReviewCard'
import { ReviewForm } from '@/components/review/ReviewForm'
import { trpc } from '@/lib/trpc'

interface ReviewsListProps {
  gameId: string
  session: Session | null
}

export function ReviewsList({ gameId, session }: ReviewsListProps) {
  const utils = trpc.useUtils()
  const { data, isLoading } = trpc.reviews.getForGame.useQuery({ gameId })
  const like = trpc.reviews.like.useMutation({
    onSuccess: () => utils.reviews.getForGame.invalidate({ gameId }),
  })
  const unlike = trpc.reviews.unlike.useMutation({
    onSuccess: () => utils.reviews.getForGame.invalidate({ gameId }),
  })
  const create = trpc.reviews.create.useMutation({
    onSuccess: () => utils.reviews.getForGame.invalidate({ gameId }),
  })

  const currentUserId = session?.user?.id

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
      {session?.user?.id && (
        <ReviewForm
          isSubmitting={create.isPending}
          onSubmit={(body, containsSpoilers) => create.mutate({ gameId, body, containsSpoilers })}
        />
      )}
      {isLoading ? (
        <p className="text-sm text-gray-400">Loading reviews…</p>
      ) : data?.reviews.length === 0 ? (
        <p className="text-sm text-gray-400">No reviews yet. Be the first to write one.</p>
      ) : (
        <div className="space-y-3">
          {data?.reviews.map((review) => {
            const liked = review.likes.some((l) => l.userId === currentUserId)
            return (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={currentUserId}
                onLike={(reviewId) => {
                  if (!currentUserId) return
                  if (liked) unlike.mutate({ reviewId })
                  else like.mutate({ reviewId })
                }}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}
