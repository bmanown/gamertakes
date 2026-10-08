import { db, type Game } from '@gamertakes/db'
import { isOfficialFromIGDB, officialCategoryId } from './official'
import { IGDB_GAME_FIELDS, catalogQuery } from './igdb-catalog'
import { runInBackground } from './background'

const IGDB_BASE = 'https://api.igdb.com/v4'

let cachedToken: { token: string; expires: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) {
    return cachedToken.token
  }
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.IGDB_CLIENT_ID}&client_secret=${process.env.IGDB_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: 'POST' }
  )
  const data = await res.json()
  cachedToken = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in - 60) * 1000,
  }
  return cachedToken.token
}

async function igdbRequest<T>(endpoint: string, body: string): Promise<T> {
  const token = await getAccessToken()
  const res = await fetch(`${IGDB_BASE}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': process.env.IGDB_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/plain',
    },
    body,
  })
  if (!res.ok) throw new Error(`IGDB error: ${res.status}`)
  return res.json()
}

export interface IGDBGame {
  id: number
  name: string
  slug: string
  summary?: string
  cover?: { url: string }
  first_release_date?: number
  platforms?: { name: string }[]
  genres?: { name: string }[]
  involved_companies?: { company: { name: string }; developer: boolean; publisher: boolean }[]
  similar_games?: number[]
  screenshots?: { url: string }[]
  aggregated_rating?: number
  aggregated_rating_count?: number
  total_rating?: number
  total_rating_count?: number
  follows?: number
  category?: number
  game_type?: number | { id?: number; type?: string }
}

export async function searchIGDB(
  query: string,
  filters?: { platform?: string; genre?: string; year?: number; official?: boolean }
): Promise<IGDBGame[]> {
  let where = `version_parent = null`
  if (filters?.official !== false) {
    where += ` & (game_type.type = ("Main Game","Remake","Remaster") | category = (0,8,9))`
  }
  if (filters?.year) {
    const start = new Date(filters.year, 0, 1).getTime() / 1000
    const end = new Date(filters.year + 1, 0, 1).getTime() / 1000
    where += ` & first_release_date >= ${start} & first_release_date < ${end}`
  }

  return igdbRequest<IGDBGame[]>(
    'games',
    `search "${query}"; fields ${IGDB_GAME_FIELDS}; where ${where}; limit 20;`
  )
}

export async function fetchIGDBGame(igdbId: number): Promise<IGDBGame> {
  const results = await igdbRequest<IGDBGame[]>(
    'games',
    `fields ${IGDB_GAME_FIELDS}; where id = ${igdbId};`
  )
  if (!results.length) throw new Error(`IGDB game ${igdbId} not found`)
  return results[0]
}

export function gameFromIGDB(igdbGame: IGDBGame): Game {
  const developer = igdbGame.involved_companies?.find((c) => c.developer)?.company.name ?? null
  const publisher = igdbGame.involved_companies?.find((c) => c.publisher)?.company.name ?? null
  const coverUrl = igdbGame.cover?.url
    ? `https:${igdbGame.cover.url.replace('t_thumb', 't_cover_big')}`
    : null
  const screenshots = (igdbGame.screenshots ?? []).map(
    (s) => `https:${s.url.replace('t_thumb', 't_screenshot_big')}`,
  )
  const now = new Date()
  return {
    id: `igdb-${igdbGame.id}`,
    igdbId: igdbGame.id,
    slug: igdbGame.slug,
    title: igdbGame.name,
    description: igdbGame.summary ?? null,
    coverImage: coverUrl,
    releaseDate: igdbGame.first_release_date
      ? new Date(igdbGame.first_release_date * 1000)
      : null,
    platforms: igdbGame.platforms?.map((p) => p.name) ?? [],
    genres: igdbGame.genres?.map((g) => g.name) ?? [],
    developer,
    publisher,
    similarGames: igdbGame.similar_games ?? [],
    screenshots,
    igdbCategory: officialCategoryId(igdbGame),
    isOfficial: isOfficialFromIGDB(igdbGame),
    openCriticId: null,
    openCriticScore: igdbGame.aggregated_rating != null ? Math.round(igdbGame.aggregated_rating) : null,
    openCriticPercent: null,
    openCriticTier: null,
    openCriticLastSync: null,
    igdbLastSync: now,
    popularityScore: igdbGame.total_rating_count ?? igdbGame.aggregated_rating_count ?? igdbGame.follows ?? 0,
    aggregatedRating: igdbGame.aggregated_rating ?? null,
    aggregatedRatingCount: igdbGame.aggregated_rating_count ?? null,
    createdAt: now,
    updatedAt: now,
  }
}

export function cacheIGDBGames(games: IGDBGame[]) {
  runInBackground(Promise.all(games.map((game) => upsertGameFromIGDB(game))))
}

export async function fetchCatalogPage(opts: { offset: number; fromYear: number; toYear: number }) {
  return igdbRequest<IGDBGame[]>('games', catalogQuery(opts))
}

export async function upsertGameFromIGDB(igdbGame: IGDBGame): Promise<Game> {
  const mapped = gameFromIGDB(igdbGame)
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, popularityScore, ...data } = mapped

  return db.game.upsert({
    where: { igdbId: igdbGame.id },
    create: { ...data, popularityScore },
    update: {
      title: data.title,
      description: data.description,
      coverImage: data.coverImage,
      releaseDate: data.releaseDate,
      platforms: data.platforms,
      genres: data.genres,
      developer: data.developer,
      publisher: data.publisher,
      similarGames: data.similarGames,
      screenshots: data.screenshots,
      igdbCategory: data.igdbCategory,
      isOfficial: data.isOfficial,
      aggregatedRating: data.aggregatedRating,
      aggregatedRatingCount: data.aggregatedRatingCount,
      popularityScore,
      igdbLastSync: new Date(),
    },
  })
}
