/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/**',
      },
      // Vercel Blob public URLs (e.g. https://<id>.public.blob.vercel-storage.com/...)
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      // Some environments may return only one subdomain level
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      // Fallback (rare): no subdomain
      {
        protocol: 'https',
        hostname: 'public.blob.vercel-storage.com',
        pathname: '/**',
      },
      // Fallback for non-public blob hostnames (just in case)
      {
        protocol: 'https',
        hostname: 'blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer, dev }) => {
    // Ottimizza la cache di webpack per gestire meglio le stringhe grandi
    // Abilita la compressione gzip per ridurre le dimensioni delle stringhe serializzate
    // Questo aiuta a ridurre i warning sulla serializzazione delle stringhe grandi
    if (config.cache && typeof config.cache === 'object' && !dev) {
      config.cache = {
        ...config.cache,
        compression: 'gzip',
      }
    }
    
    return config
  },
}

module.exports = nextConfig

