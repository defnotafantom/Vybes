/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Required for GitHub Pages static export
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      // Vercel Blob public URLs (e.g. https://<id>.public.blob.vercel-storage.com/...)
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // Disable server-side features for static export
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/new' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/new' : '',
}

module.exports = nextConfig



