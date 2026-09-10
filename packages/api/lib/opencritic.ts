import { db, type Game } from '@gamertakes/db'

const OC_BASE = 'https://api.opencritic.com/api'

interface OCGame {
  id: number
  name: string
  topCriticScore: number
  percentRecommended: number
  tier: string
}

async function searchOpenCritic(title: string): Promise<OCGame[]> {
  const res = await fetch(`${OC_BASE}/game/search?criteria=${encodeURIComponent(title)}`, {
    headers: { 'User-Agent': 'GamerTakes/1.0' },
  })
  if (!res.ok) return []
  return res.json()
}

async function getOpenCriticGame(id: number): Promise<OCGame | null> {
  const res = await fetch(`${OC_BASE}/game/${id}`, {
    headers: { 'User-Agent': 'GamerTakes/1.0' },
  })
  if (!res.ok) return null
  return res.json()
}

export async function matchAndSyncOpenCritic(game: Game): Promise<void> {
  try {
    let ocId = game.openCriticId

    if (!ocId) {
      const results = await searchOpenCritic(game.title)
      const match = results.find(
        (r) => r.name.toLowerCase() === game.title.toLowerCase()
      )
      if (!match) return
      ocId = match.id
    }

    const ocGame = await getOpenCriticGame(ocId)
    if (!ocGame) return

    await db.game.update({
      where: { id: game.id },
      data: {
        openCriticId: ocId,
        openCriticScore: ocGame.topCriticScore >= 0 ? ocGame.topCriticScore : null,
        openCriticPercent: ocGame.percentRecommended >= 0 ? ocGame.percentRecommended : null,
        openCriticTier: ocGame.tier ?? null,
        openCriticLastSync: new Date(),
      },
    })
  } catch (e) {
    console.error(`OpenCritic sync failed for ${game.title}:`, e)
  }
}
