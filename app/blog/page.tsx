import Link from "next/link"
import { ArrowLeft, Calendar, Tag } from "lucide-react"
import Footer from "../components/footer"
import { getAllPosts } from "../../lib/blog"

export const metadata = {
  title: "Blog | Jan Wiegmann",
  description: "Technische Artikel und Einblicke zu Softwarearchitektur und -entwicklung",
}

export default function BlogPage() {
  const allPosts = getAllPosts()

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={16} />
            Zurück zur Startseite
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-4">Blog</h1>
          <p className="text-gray-400 max-w-2xl">
            Gedanken, Einblicke und technische Deep-Dives zu Softwarearchitektur und -entwicklung.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {allPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors group"
            >
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-400 mb-6 flex-grow">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{new Date(post.date).toLocaleDateString('de-DE')}</span>
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag size={14} />
                      <span>{post.tags[0]}</span>
                      {post.tags.length > 1 && <span>+{post.tags.length - 1}</span>}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {allPosts.length === 0 && (
            <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-xl font-semibold mb-3">Bald verfügbar...</h3>
                <p className="text-gray-400 mb-6 flex-grow">
                  Technische Artikel und Einblicke zu Softwarearchitektur und -entwicklung werden hier bald veröffentlicht.
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                  <span>Bleibt gespannt</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}

