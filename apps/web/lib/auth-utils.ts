import { db } from '@gamertakes/db'
import { z } from 'zod'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function authorizeCredentials(credentials: unknown) {
  const parsed = credentialsSchema.safeParse(credentials)
  if (!parsed.success) return null

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
  })
  if (!user) return null
  // Password check — bcrypt added in Task 5
  return user
}

export function jwtCallback({
  token,
  user,
}: {
  token: { id?: string; username?: string }
  user?: { id: string; username?: string | null }
}) {
  if (user) {
    token.id = user.id
    token.username = user.username ?? undefined
  }
  return token
}

export function sessionCallback({
  session,
  token,
}: {
  session: { user: { id?: string; username?: string } }
  token: { id?: string; username?: string }
}) {
  if (token) {
    session.user.id = token.id as string
    session.user.username = token.username as string
  }
  return session
}
