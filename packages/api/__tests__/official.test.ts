import { describe, it, expect } from 'vitest'
import {
  isOfficialFromIGDB,
  isOfficialGame,
  officialGameWhere,
  OFFICIAL_CATEGORIES,
} from '../lib/official'

describe('isOfficialFromIGDB', () => {
  it('treats Main Game, Remake, and Remaster type names as official', () => {
    expect(isOfficialFromIGDB({ game_type: { id: 0, type: 'Main Game' } })).toBe(true)
    expect(isOfficialFromIGDB({ game_type: { id: 8, type: 'Remake' } })).toBe(true)
    expect(isOfficialFromIGDB({ game_type: { id: 9, type: 'Remaster' } })).toBe(true)
  })

  it('treats mods and bundles as unofficial', () => {
    expect(isOfficialFromIGDB({ game_type: { id: 5, type: 'Mod' } })).toBe(false)
    expect(isOfficialFromIGDB({ game_type: { id: 3, type: 'Bundle' } })).toBe(false)
  })

  it('falls back to the legacy category enum', () => {
    expect(isOfficialFromIGDB({ category: 0 })).toBe(true)
    expect(isOfficialFromIGDB({ category: 5 })).toBe(false)
  })
})

describe('isOfficialGame', () => {
  it('prefers the stored official flag', () => {
    expect(isOfficialGame({ isOfficial: true, igdbCategory: 5 })).toBe(true)
    expect(isOfficialGame({ isOfficial: false, igdbCategory: 0 })).toBe(false)
  })

  it('treats main games, remakes, and remasters as official', () => {
    expect(isOfficialGame({ igdbCategory: 0 })).toBe(true)
    expect(isOfficialGame({ igdbCategory: 8 })).toBe(true)
    expect(isOfficialGame({ igdbCategory: 9 })).toBe(true)
  })

  it('treats mods, bundles, and fangame-style extras as unofficial', () => {
    expect(isOfficialGame({ igdbCategory: 3 })).toBe(false)
    expect(isOfficialGame({ igdbCategory: 5 })).toBe(false)
  })

  it('flags unsynced games with a critic score as official', () => {
    expect(isOfficialGame({ igdbCategory: null, openCriticScore: 91 })).toBe(true)
    expect(isOfficialGame({ igdbCategory: null, openCriticScore: null })).toBe(false)
  })
})

describe('officialGameWhere', () => {
  it('includes flagged official games and scored games that are not categorized yet', () => {
    expect(officialGameWhere()).toEqual({
      OR: [
        { isOfficial: true },
        { isOfficial: null, igdbCategory: { in: OFFICIAL_CATEGORIES } },
        { isOfficial: null, igdbCategory: null, openCriticScore: { not: null } },
      ],
    })
  })
})
