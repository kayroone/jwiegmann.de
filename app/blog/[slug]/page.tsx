import Link from "next/link"
import { ArrowLeft, Calendar, Tag } from "lucide-react"
import Footer from "../../components/footer"
import { getPostBySlug, markdownToHtml, getAllPosts } from "../../../lib/blog"
import { notFound } from "next/navigation"

interface BlogPostParams {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: BlogPostParams) {
  try {
    const { slug } = await params
    const post = getPostBySlug(slug)
    return {
      title: `${post.title} | Jan Wiegmann`,
      description: post.excerpt || "Technical article on software architecture and development",
    }
  } catch {
    return {
      title: "Article Not Found | Jan Wiegmann",
      description: "The requested article could not be found",
    }
  }
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPost({ params }: BlogPostParams) {
  let post
  try {
    const { slug } = await params
    post = getPostBySlug(slug)
  } catch {
    notFound()
  }

  const content = await markdownToHtml(post.content)

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
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-gray-400 mb-4">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{new Date(post.date).toLocaleDateString()}</span>
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag size={16} />
                  <div className="flex gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-zinc-800 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div 
            className="prose prose-invert prose-lg max-w-none 
                       [&>p]:mb-6 
                       [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6 [&>h1]:mt-8
                       [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mb-4 [&>h2]:mt-8 
                       [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mb-3 [&>h3]:mt-6
                       [&>pre]:bg-zinc-900 [&>pre]:border [&>pre]:border-zinc-700 [&>pre]:rounded-lg [&>pre]:p-4 [&>pre]:mb-6
                       [&>code]:bg-zinc-800 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-sm"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </article>
      <Footer />
    </main>
  )
}

