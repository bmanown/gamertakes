export const OFFICIAL_CATEGORIES = [0, 8, 9]
export const OFFICIAL_TYPE_NAMES = ['Main Game', 'Remake', 'Remaster']

export function officialCategoryId(game: {
  category?: number
  game_type?: number | { id?: number; type?: string }
}): number | null {
  if (typeof game.game_type === 'object' && game.game_type?.id != null) return game.game_type.id
  if (typeof game.game_type === 'number') return game.game_type
  return game.category ?? null
}

export function isOfficialFromIGDB(game: {
  category?: number
  game_type?: number | { id?: number; type?: string }
}): boolean {
  const typeName = typeof game.game_type === 'object' ? game.game_type?.type : undefined
  if (typeName) {
    return OFFICIAL_TYPE_NAMES.some((name) => name.toLowerCase() === typeName.toLowerCase())
  }
  const id = officialCategoryId(game)
  return id != null && OFFICIAL_CATEGORIES.includes(id)
}

export function isOfficialGame(game: {
  isOfficial?: boolean | null
  igdbCategory?: number | null
  openCriticScore?: number | null
}): boolean {
  if (game.isOfficial != null) return game.isOfficial
  if (game.igdbCategory == null) return game.openCriticScore != null
  return OFFICIAL_CATEGORIES.includes(game.igdbCategory)
}

export function officialGameWhere() {
  return {
    OR: [
      { isOfficial: true },
      { isOfficial: null, igdbCategory: { in: OFFICIAL_CATEGORIES } },
      { isOfficial: null, igdbCategory: null, openCriticScore: { not: null } },
    ],
  }
}
