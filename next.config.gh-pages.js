/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Required for GitHub Pages static export
  images: {
    unoptimized: true, // Required for static export
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
  // Disable server-side features for static export
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/new' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/new' : '',
}

module.exports = nextConfig



