import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createCallerFactory } from '@gamertakes/api/trpc'
import { appRouter } from '@gamertakes/api'
import { auth } from '@/lib/auth'
import { db } from '@gamertakes/db'
import { ActivityItem } from '@/components/social/ActivityItem'
import { FollowButton } from '@/components/social/FollowButton'

interface PageProps { params: { username: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const user = await db.user.findUnique({ where: { username: params.username } })
  if (!user) return {}
  return { title: user.displayName ?? user.username }
}

export default async function UserProfilePage({ params }: PageProps) {
  const session = await auth()
  const createCaller = createCallerFactory(appRouter)
  const caller = createCaller({ session, db })

  let profile
  try {
    profile = await caller.users.getProfile({ username: params.username })
  } catch {
    if (session?.user?.id && session.user.username === params.username) {
      const me = await db.user.findUnique({
        where: { id: session.user.id },
        select: { username: true },
      })
      if (me && me.username !== params.username) {
        redirect(`/users/${me.username}`)
      }
    }
    notFound()
  }

  const { activities } = await caller.activity.getUserActivity({ userId: profile.id, limit: 20 })

  const isOwn = session?.user?.id === profile.id

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-start gap-6 mb-8">
        <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden shrink-0">
          {profile.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt={profile.username} className="h-full w-full object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold">{profile.displayName ?? profile.username}</h1>
          <p className="text-gray-400">@{profile.username}</p>
          {profile.bio && <p className="text-gray-600 mt-2 text-sm">{profile.bio}</p>}
          <div className="flex gap-4 mt-3 text-sm text-gray-500">
            <span><strong className="text-gray-900">{profile._count.entries}</strong> games</span>
            <span><strong className="text-gray-900">{profile._count.reviews}</strong> reviews</span>
            <span><strong className="text-gray-900">{profile._count.followers}</strong> followers</span>
            <span><strong className="text-gray-900">{profile._count.following}</strong> following</span>
          </div>
        </div>
        {!isOwn && session && (
          <div className="shrink-0">
            <FollowButton userId={profile.id} />
          </div>
        )}
      </div>

      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      <div className="rounded-xl border border-gray-100 bg-white divide-y divide-gray-100">
        {activities.length === 0 ? (
          <p className="text-gray-400 text-sm p-6 text-center">No activity yet.</p>
        ) : (
          activities.map((a) => <ActivityItem key={a.id} activity={a as never} />)
        )}
      </div>
    </div>
  )
}
