import { createTRPCReact } from '@trpc/react-query'
import { type AppRouter } from '@gamertakes/api'

export const trpc = createTRPCReact<AppRouter>()
