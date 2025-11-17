import { getAllPosts } from '@/lib/blog'

/**
 * Generate RSS feed for blog posts
 */
export async function GET() {
  const posts = getAllPosts()
  const baseUrl = 'https://jwiegmann.de'

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Jan Wiegmann | Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Technical articles on software architecture and development</description>
    <language>de-DE</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${posts
      .map(
        (post) => `
    <item>
      <title>${post.title}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <description>${post.excerpt || ''}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid>${baseUrl}/blog/${post.slug}</guid>
    </item>`
      )
      .join('')}
  </channel>
</rss>`

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
