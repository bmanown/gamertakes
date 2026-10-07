import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { hashPassword, placeholderUsername } from '../lib/password'

export const usersRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8).max(72),
    }))
    .mutation(async ({ input, ctx }) => {
      const email = input.email.trim().toLowerCase()
      const existing = await ctx.db.user.findUnique({ where: { email } })
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'An account with this email already exists' })
      }

      const passwordHash = await hashPassword(input.password)
      let username = placeholderUsername(email)
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const taken = await ctx.db.user.findUnique({ where: { username } })
        if (!taken) break
        username = placeholderUsername(email)
      }

      return ctx.db.user.create({
        data: { email, username, passwordHash },
        select: { id: true, email: true, username: true },
      })
    }),

  getProfile: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { username: input.username },
        select: {
          id: true, username: true, displayName: true, avatarUrl: true, bio: true,
          isPrivate: true, createdAt: true,
          _count: { select: { entries: true, reviews: true, lists: true, followers: true, following: true } },
        },
      })
      if (!user) throw new TRPCError({ code: 'NOT_FOUND' })
      return user
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/).optional(),
      displayName: z.string().max(100).optional(),
      bio: z.string().max(500).optional(),
      isPrivate: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (input.username) {
        const taken = await ctx.db.user.findFirst({
          where: { username: input.username, NOT: { id: ctx.session.user.id } },
        })
        if (taken) throw new TRPCError({ code: 'CONFLICT', message: 'Username is taken' })
      }
      return ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      })
    }),

  search: publicProcedure
    .input(z.object({ query: z.string().min(1).max(50) }))
    .query(async ({ input, ctx }) => {
      return ctx.db.user.findMany({
        where: {
          OR: [
            { username: { contains: input.query, mode: 'insensitive' } },
            { displayName: { contains: input.query, mode: 'insensitive' } },
          ],
          isPrivate: false,
        },
        select: { id: true, username: true, displayName: true, avatarUrl: true },
        take: 20,
      })
    }),
})
