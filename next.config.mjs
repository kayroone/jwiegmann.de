/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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
    ]
  },
}

export default nextConfig
