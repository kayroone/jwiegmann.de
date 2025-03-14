import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Footer from "../../components/footer"

interface BlogPostParams {
  params: {
    slug: string
  }
}

export function generateMetadata({ params }: BlogPostParams) {
  return {
    title: `Blog Post | Jan Wiegmann`,
    description: "Technical article on software architecture and development",
  }
}

export default function BlogPost({ params }: BlogPostParams) {
  return (
    <main className="min-h-screen bg-black text-white">
      <article className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back to all articles
          </Link>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">Coming Soon</h1>
            <div className="flex items-center gap-4 text-gray-400">
              <span>Stay tuned for upcoming articles</span>
            </div>
          </div>

          <div className="prose prose-invert prose-lg max-w-none">
            <p>
              Blog posts are coming soon. Check back later for technical articles and insights on software architecture
              and development.
            </p>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  )
}

