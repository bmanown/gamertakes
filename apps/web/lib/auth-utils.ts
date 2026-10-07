import { db } from '@gamertakes/db'
import { verifyPassword } from '@gamertakes/api/password'
import { z } from 'zod'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function authorizeCredentials(credentials: unknown) {
  const parsed = credentialsSchema.safeParse(credentials)
  if (!parsed.success) return null

  const user = await db.user.findUnique({
    where: { email: parsed.data.email.trim().toLowerCase() },
  })
  if (!user?.passwordHash) return null
  const matches = await verifyPassword(parsed.data.password, user.passwordHash)
  if (!matches) return null
  return user
}

export function jwtCallback({
  token,
  user,
}: {
  token: { id?: string; username?: string; [key: string]: unknown }
  user?: { id: string; username?: string | null }
}) {
  if (user) {
    token.id = user.id
    token.username = user.username ?? undefined
  }
  return token
}

export function sessionCallback<T extends { user: { id?: string; username?: string } }>({
  session,
  token,
}: {
  session: T
  token: { id?: string; username?: string; [key: string]: unknown }
}): T {
  if (token) {
    session.user.id = token.id as string
    session.user.username = token.username as string
  }
  return session
}
