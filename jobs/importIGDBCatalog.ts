import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fetchCatalogPage, upsertGameFromIGDB } from '../packages/api/lib/igdb'
import {
  CATALOG_MAX_OFFSET,
  CATALOG_PAGE_SIZE,
  CATALOG_TARGET,
  catalogWindows,
} from '../packages/api/lib/igdb-catalog'

function loadEnv() {
  for (const file of [
    '.env',
    '.env.local',
    'packages/db/.env',
    'packages/db/.env.local',
    'apps/web/.env',
    'apps/web/.env.local',
  ]) {
    const path = resolve(file)
    if (!existsSync(path)) continue
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      if (!line || line.startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq < 1) continue
      const key = line.slice(0, eq).trim()
      const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      if (key && process.env[key] == null) process.env[key] = value
    }
  }
}

function sleep(ms: number) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms))
}

export async function importIGDBCatalog(target = CATALOG_TARGET) {
  const seen = new Set<number>()
  for (const window of catalogWindows) {
    for (let offset = 0; offset <= CATALOG_MAX_OFFSET && seen.size < target; offset += CATALOG_PAGE_SIZE) {
      const page = await fetchCatalogPage({
        offset,
        fromYear: window.fromYear,
        toYear: window.toYear,
      })
      await sleep(250)
      if (page.length === 0) break
      const fresh = page.filter((game) => !seen.has(game.id)).slice(0, target - seen.size)
      for (let i = 0; i < fresh.length; i += 8) {
        await Promise.all(fresh.slice(i, i + 8).map(async (game) => {
          try {
            await upsertGameFromIGDB(game)
            seen.add(game.id)
            if (seen.size % 100 === 0) {
              console.log(`Imported ${seen.size}/${target}`)
            }
          } catch (err) {
            console.error(`Skip ${game.slug}:`, err)
          }
        }))
      }
      if (page.length < CATALOG_PAGE_SIZE) break
    }
  }
  return { imported: seen.size }
}

if (require.main === module) {
  loadEnv()
  importIGDBCatalog()
    .then((result) => {
      console.log(`Done. ${result.imported} official games cached.`)
    })
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
