export interface SteamGame {
  appid: number
  name: string
  playtime_forever: number  // minutes
  rtime_last_played: number // unix timestamp
}

export async function fetchSteamLibrary(steamId: string): Promise<SteamGame[]> {
  const url = new URL('http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/')
  url.searchParams.set('key', process.env.STEAM_API_KEY!)
  url.searchParams.set('steamid', steamId)
  url.searchParams.set('include_appinfo', '1')
  url.searchParams.set('include_played_free_games', '1')
  url.searchParams.set('format', 'json')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Steam API error: ${res.status}`)
  const data = await res.json()
  return data.response?.games ?? []
}

export async function resolveSteamVanityUrl(vanityUrl: string): Promise<string> {
  const url = new URL('http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/')
  url.searchParams.set('key', process.env.STEAM_API_KEY!)
  url.searchParams.set('vanityurl', vanityUrl)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Steam API error: ${res.status}`)
  const data = await res.json()
  if (data.response?.success !== 1) throw new Error('Steam vanity URL not found')
  return data.response.steamid
}
