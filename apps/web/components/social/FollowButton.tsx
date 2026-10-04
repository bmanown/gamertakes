'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { trpc } from '@/lib/trpc'

interface FollowButtonProps {
  userId: string
  initialFollowing?: boolean
}

export function FollowButton({ userId, initialFollowing = false }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const follow = trpc.social.follow.useMutation({
    onSuccess: () => setFollowing(true),
  })
  const unfollow = trpc.social.unfollow.useMutation({
    onSuccess: () => setFollowing(false),
  })

  return (
    <Button
      variant={following ? 'secondary' : 'primary'}
      onClick={() => (following ? unfollow.mutate({ userId }) : follow.mutate({ userId }))}
      disabled={follow.isPending || unfollow.isPending}
    >
      {following ? 'Following' : 'Follow'}
    </Button>
  )
}
