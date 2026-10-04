import Link from 'next/link'
import { createCallerFactory } from '@gamertakes/api/trpc'
import { appRouter } from '@gamertakes/api'
import { db } from '@gamertakes/db'
import { GameCard } from '@/components/game/GameCard'
import { Button } from '@/components/ui/Button'

export const revalidate = 3600

export default async function LandingPage() {
  const createCaller = createCallerFactory(appRouter)
  const caller = createCaller({ session: null, db })
  const popular = await caller.games.getPopular({ limit: 12 })

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-24 px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">Track every game you play.</h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Rate, review, and discover games with friends. Your gaming journey, all in one place.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/signup"><Button size="lg">Get Started Free</Button></Link>
          <Link href="/games"><Button variant="secondary" size="lg">Browse Games</Button></Link>
        </div>
      </section>

      {/* Popular games */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Games</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {popular.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>
    </div>
  )
}
