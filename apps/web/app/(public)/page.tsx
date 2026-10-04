import Link from 'next/link'
import { PopularGames } from '@/components/game/PopularGames'
import { Button } from '@/components/ui/Button'

export default function LandingPage() {
  return (
    <div>
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

      <PopularGames />
    </div>
  )
}
