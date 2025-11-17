import { MetadataRoute } from 'next'

/**
 * Configure search engine crawling rules
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [],
    },
    sitemap: 'https://jwiegmann.de/sitemap.xml',
  }
}
