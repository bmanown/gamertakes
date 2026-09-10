import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@gamertakes/db'
import { authorizeCredentials, jwtCallback, sessionCallback } from './auth-utils'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: authorizeCredentials,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      return jwtCallback({
        token,
        user: user
          ? { id: user.id!, username: (user as { username?: string | null }).username }
          : undefined,
      })
    },
    async session({ session, token }) {
      return sessionCallback({ session, token })
    },
  },
  pages: {
    signIn: '/auth/signin',
    newUser: '/auth/username',
  },
})
