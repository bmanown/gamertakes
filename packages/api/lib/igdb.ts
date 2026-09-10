import { db, type Game } from '@gamertakes/db'

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
}

export async function searchIGDB(
  query: string,
  filters?: { platform?: string; genre?: string; year?: number }
): Promise<IGDBGame[]> {
  let where = `version_parent = null`
  if (filters?.year) {
    const start = new Date(filters.year, 0, 1).getTime() / 1000
    const end = new Date(filters.year + 1, 0, 1).getTime() / 1000
    where += ` & first_release_date >= ${start} & first_release_date < ${end}`
  }

  return igdbRequest<IGDBGame[]>(
    'games',
    `search "${query}"; fields id,name,slug,summary,cover.url,first_release_date,platforms.name,genres.name,involved_companies.company.name,involved_companies.developer,involved_companies.publisher,similar_games,screenshots.url; where ${where}; limit 20;`
  )
}

export async function fetchIGDBGame(igdbId: number): Promise<IGDBGame> {
  const results = await igdbRequest<IGDBGame[]>(
    'games',
    `fields id,name,slug,summary,cover.url,first_release_date,platforms.name,genres.name,involved_companies.company.name,involved_companies.developer,involved_companies.publisher,similar_games,screenshots.url; where id = ${igdbId};`
  )
  if (!results.length) throw new Error(`IGDB game ${igdbId} not found`)
  return results[0]
}

export async function upsertGameFromIGDB(igdbGame: IGDBGame): Promise<Game> {
  const developer = igdbGame.involved_companies?.find((c) => c.developer)?.company.name
  const publisher = igdbGame.involved_companies?.find((c) => c.publisher)?.company.name
  const coverUrl = igdbGame.cover?.url
    ? `https:${igdbGame.cover.url.replace('t_thumb', 't_cover_big')}`
    : null
  const screenshots = (igdbGame.screenshots ?? []).map(
    (s) => `https:${s.url.replace('t_thumb', 't_screenshot_big')}`
  )

  return db.game.upsert({
    where: { igdbId: igdbGame.id },
    create: {
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
      developer: developer ?? null,
      publisher: publisher ?? null,
      similarGames: igdbGame.similar_games ?? [],
      screenshots,
    },
    update: {
      title: igdbGame.name,
      description: igdbGame.summary ?? null,
      coverImage: coverUrl,
      releaseDate: igdbGame.first_release_date
        ? new Date(igdbGame.first_release_date * 1000)
        : null,
      platforms: igdbGame.platforms?.map((p) => p.name) ?? [],
      genres: igdbGame.genres?.map((g) => g.name) ?? [],
      developer: developer ?? null,
      publisher: publisher ?? null,
      similarGames: igdbGame.similar_games ?? [],
      screenshots,
      igdbLastSync: new Date(),
    },
  })
}
