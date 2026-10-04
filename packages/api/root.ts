import { createTRPCRouter } from './trpc'
import { gamesRouter } from './routers/games'
import { libraryRouter } from './routers/library'
import { reviewsRouter } from './routers/reviews'
import { listsRouter } from './routers/lists'
import { usersRouter } from './routers/users'
import { socialRouter } from './routers/social'
import { activityRouter } from './routers/activity'
import { integrationsRouter } from './routers/integrations'
import { newsRouter } from './routers/news'

export const appRouter = createTRPCRouter({
  games: gamesRouter,
  library: libraryRouter,
  reviews: reviewsRouter,
  lists: listsRouter,
  users: usersRouter,
  social: socialRouter,
  activity: activityRouter,
  integrations: integrationsRouter,
  news: newsRouter,
})

export type AppRouter = typeof appRouter
