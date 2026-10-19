import { db, type Game } from '@gamertakes/db'
import { fetchIGDBGame } from './igdb'

export function openCriticHeaders(): HeadersInit {
  const headers: Record<string, string> = { 'User-Agent': 'GamerTakes/1.0' }
  if (process.env.OPENCRITIC_API_KEY) {
    headers['X-RapidAPI-Key'] = process.env.OPENCRITIC_API_KEY
    headers['X-RapidAPI-Host'] = 'opencritic-api.p.rapidapi.com'
  }
  return headers
}

export function openCriticUrl(path: string) {
  const base = process.env.OPENCRITIC_API_KEY
    ? 'https://opencritic-api.p.rapidapi.com'
    : 'https://api.opencritic.com/api'
  return `${base}${path}`
}

interface OCGame {
  id: number
  name: string
  topCriticScore: number
  percentRecommended: number
  tier: string
}

export async function searchOpenCritic(title: string): Promise<OCGame[]> {
  const res = await fetch(openCriticUrl(`/game/search?criteria=${encodeURIComponent(title)}`), {
    headers: openCriticHeaders(),
  })
  if (!res.ok) throw new Error(`OpenCritic search failed (${res.status})`)
  return res.json()
}

async function getOpenCriticGame(id: number): Promise<OCGame | null> {
  const res = await fetch(openCriticUrl(`/game/${id}`), {
    headers: openCriticHeaders(),
  })
  if (!res.ok) return null
  return res.json()
}

export async function fetchOpenCriticReviews(id: number) {
  const res = await fetch(openCriticUrl(`/review/game/${id}`), {
    headers: openCriticHeaders(),
  })
  if (!res.ok) throw new Error(`OpenCritic reviews failed (${res.status})`)
  const data = await res.json()
  return Array.isArray(data) ? data : []
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

export async function fillCriticScore(game: Game): Promise<void> {
  await matchAndSyncOpenCritic(game)
  const latest = await db.game.findUnique({ where: { id: game.id } })
  if (!latest || latest.openCriticScore != null) return
  if (!latest.igdbId) return

  try {
    const igdb = await fetchIGDBGame(latest.igdbId)
    if (igdb.aggregated_rating == null) {
      await db.game.update({
        where: { id: latest.id },
        data: { openCriticLastSync: new Date() },
      })
      return
    }
    await db.game.update({
      where: { id: latest.id },
      data: {
        openCriticScore: Math.round(igdb.aggregated_rating),
        openCriticLastSync: new Date(),
      },
    })
  } catch (e) {
    console.error(`IGDB critic fallback failed for ${game.title}:`, e)
  }
}
