import { Button } from '@/components/ui/Button'
import { GameComponentsPreview } from '@/components/game/GameComponentsPreview'

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-brand-600">GamerTakes</p>
      <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
        Track, rate, and discover video games with friends.
      </h1>
      <p className="text-lg text-gray-600">
        A Goodreads-style shelf for what you are playing, what you finished, and what you keep meaning to start.
      </p>
      <div>
        <Button>Browse games</Button>
      </div>
      <GameComponentsPreview />
    </main>
  )
}
