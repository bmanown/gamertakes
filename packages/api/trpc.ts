import { initTRPC, TRPCError } from '@trpc/server'
import { ZodError } from 'zod'
import { db } from '@gamertakes/db'

export interface Session {
  user: {
    id: string
    username?: string
    email?: string | null
    name?: string | null
    image?: string | null
  }
  expires: string
}

export interface Context {
  session: Session | null
  db: typeof db
}

export async function createTRPCContext(opts: {
  session: Session | null
}): Promise<Context> {
  return {
    session: opts.session,
    db,
  }
}

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
export const createCallerFactory = t.createCallerFactory

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  })
})
