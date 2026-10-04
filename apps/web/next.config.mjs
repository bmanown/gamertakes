import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gamertakes/api', '@gamertakes/db', '@gamertakes/types'],
  outputFileTracingRoot: path.join(__dirname, '../..'),
  serverExternalPackages: ['@prisma/client', '.prisma/client'],
  outputFileTracingIncludes: {
    '/**': [
      './.prisma/client/**',
      './node_modules/.prisma/client/**',
      '../../node_modules/.prisma/client/**',
      '../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/**',
    ],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.igdb.com' },
    ],
  },
}

export default nextConfig
