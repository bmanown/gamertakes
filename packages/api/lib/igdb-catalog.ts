export const CATALOG_PAGE_SIZE = 500
export const CATALOG_TARGET = 10_000
export const CATALOG_MAX_OFFSET = 4_500

export const IGDB_GAME_FIELDS =
  'id,name,slug,summary,cover.url,first_release_date,platforms.name,genres.name,involved_companies.company.name,involved_companies.developer,involved_companies.publisher,similar_games,screenshots.url,aggregated_rating,aggregated_rating_count,total_rating,total_rating_count,category,game_type.type,follows'

export const catalogWindows = [
  { fromYear: 2020, toYear: 2027 },
  { fromYear: 2010, toYear: 2020 },
  { fromYear: 2000, toYear: 2010 },
  { fromYear: 1970, toYear: 2000 },
] as const

export function catalogQuery(opts: { offset: number; fromYear: number; toYear: number }) {
  const start = Math.floor(Date.UTC(opts.fromYear, 0, 1) / 1000)
  const end = Math.floor(Date.UTC(opts.toYear, 0, 1) / 1000)
  const where = [
    'version_parent = null',
    '(game_type.type = ("Main Game","Remake","Remaster") | category = (0,8,9))',
    `first_release_date >= ${start}`,
    `first_release_date < ${end}`,
  ].join(' & ')
  return `fields ${IGDB_GAME_FIELDS}; where ${where}; sort total_rating_count desc; limit ${CATALOG_PAGE_SIZE}; offset ${opts.offset};`
}
