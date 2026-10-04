/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gamertakes/api', '@gamertakes/db', '@gamertakes/types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.igdb.com' },
    ],
  },
}

export default nextConfig
