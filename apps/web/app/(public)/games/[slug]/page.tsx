import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createCallerFactory } from '@gamertakes/api/trpc'
import { appRouter } from '@gamertakes/api'
import { auth } from '@/lib/auth'
import { db } from '@gamertakes/db'
import { CriticScoreBadge } from '@/components/ui/CriticScoreBadge'
import { StarRating } from '@/components/ui/StarRating'
import { GameDetailActions } from './GameDetailActions'
import { ReviewsList } from './ReviewsList'

export const revalidate = 86400

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const game = await db.game.findUnique({ where: { slug: params.slug } })
  if (!game) return {}
  return {
    title: game.title,
    description: game.description?.slice(0, 160),
    openGraph: { images: game.coverImage ? [game.coverImage] : [] },
  }
}

export default async function GamePage({ params }: PageProps) {
  const session = await auth()
  const createCaller = createCallerFactory(appRouter)
  const caller = createCaller({ session, db })

  let gameData
  try {
    gameData = await caller.games.getBySlug({ slug: params.slug })
  } catch {
    notFound()
  }

  const userEntry = session?.user?.id
    ? await caller.library.getEntry({ gameId: gameData.id, userId: session.user.id })
    : null

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        {/* Cover */}
        <div className="space-y-4">
          <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
            {gameData.coverImage && (
              <Image src={gameData.coverImage} alt={gameData.title} fill className="object-cover" priority />
            )}
          </div>
          <GameDetailActions game={gameData} userEntry={userEntry} session={session} />
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{gameData.title}</h1>
            {(gameData.developer || gameData.publisher) && (
              <p className="text-gray-500 mt-1">
                {gameData.developer}{gameData.publisher && gameData.publisher !== gameData.developer && ` · ${gameData.publisher}`}
              </p>
            )}
            {gameData.releaseDate && (
              <p className="text-sm text-gray-400 mt-1">
                {new Date(gameData.releaseDate).getFullYear()}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {gameData.platforms.map((p) => (
              <span key={p} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">{p}</span>
            ))}
            {gameData.genres.map((g) => (
              <span key={g} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">{g}</span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Critic Score</p>
              <CriticScoreBadge score={gameData.openCriticScore ?? null} tier={gameData.openCriticTier} />
            </div>
            {gameData.communityRating && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Community</p>
                <div className="flex items-center gap-2">
                  <StarRating value={Math.round(gameData.communityRating)} readonly />
                  <span className="text-sm text-gray-500">{gameData.totalRatings} ratings</span>
                </div>
              </div>
            )}
          </div>

          {gameData.description && (
            <p className="text-gray-600 leading-relaxed">{gameData.description}</p>
          )}

          <ReviewsList gameId={gameData.id} session={session} />
        </div>
      </div>
    </main>
  )
}
