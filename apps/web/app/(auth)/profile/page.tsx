import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@gamertakes/db'

export default async function MyProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  })
  if (!user) redirect('/auth/username')

  redirect(`/users/${user.username}`)
}
