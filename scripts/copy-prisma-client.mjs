import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function hasEngine(dir) {
  if (!existsSync(dir)) return false
  try {
    return readdirSync(dir).some((name) => /query_engine|libquery_engine/i.test(name) || name === 'schema.prisma')
  } catch {
    return false
  }
}

function pnpmPrismaClients() {
  const pnpmDir = join(root, 'node_modules', '.pnpm')
  if (!existsSync(pnpmDir)) return []
  return readdirSync(pnpmDir)
    .filter((name) => name.startsWith('@prisma+client@'))
    .flatMap((name) => [
      join(pnpmDir, name, 'node_modules', '.prisma', 'client'),
      join(pnpmDir, name, 'node_modules', '@prisma', 'client'),
    ])
}

const candidates = [
  ...pnpmPrismaClients(),
  join(root, 'node_modules', '.prisma', 'client'),
  join(root, 'node_modules', '@prisma', 'client'),
  join(root, 'apps', 'web', 'node_modules', '.prisma', 'client'),
  join(root, 'packages', 'db', 'node_modules', '.prisma', 'client'),
]

const source = candidates.find(hasEngine)
if (!source) {
  console.error('Could not find generated Prisma client. Looked in:')
  for (const dir of candidates) console.error(`  ${dir}`)
  process.exit(1)
}

const dest = join(root, 'apps', 'web', '.prisma', 'client')
mkdirSync(dest, { recursive: true })
cpSync(source, dest, { recursive: true })
console.log(`Copied Prisma client ${source} -> ${dest}`)
