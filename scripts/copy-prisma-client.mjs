import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function findGeneratedClient() {
  const candidates = []
  try {
    candidates.push(join(dirname(require.resolve('@prisma/client/package.json', { paths: [root] })), '..', '.prisma', 'client'))
  } catch {
    // fall through to known workspace paths
  }
  candidates.push(
    join(root, 'node_modules', '.prisma', 'client'),
    join(root, 'node_modules', '@prisma', 'client', '..', '.prisma', 'client'),
    join(root, 'packages', 'db', 'node_modules', '.prisma', 'client'),
  )
  return candidates.find((dir) => existsSync(join(dir, 'schema.prisma')) || existsSync(dir))
}

const source = findGeneratedClient()
if (!source) {
  console.error('Could not find generated Prisma client after prisma generate')
  process.exit(1)
}

const dest = join(root, 'apps', 'web', '.prisma', 'client')
mkdirSync(dest, { recursive: true })
cpSync(source, dest, { recursive: true })
console.log(`Copied Prisma client ${source} -> ${dest}`)
