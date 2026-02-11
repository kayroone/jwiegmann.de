/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  async redirects() {
    return [
      // Redirect old blog post to blog overview
      {
        source: '/blog/first-post',
        destination: '/blog',
        permanent: true, // 301 redirect
      },
      // Force HTTPS for all HTTP requests
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://jwiegmann.de/:path*',
        permanent: true, // 301 redirect
      },
    ]
  },
}

export default nextConfig
