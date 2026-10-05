export function browseGamesHref(query: string, officialOnly = true) {
  const params = new URLSearchParams()
  if (query.trim()) params.set('q', query.trim())
  if (!officialOnly) params.set('official', '0')
  const qs = params.toString()
  return qs ? `/games?${qs}` : '/games'
}

export function popularHref(officialOnly: boolean) {
  return officialOnly ? '/' : '/?official=0'
}
