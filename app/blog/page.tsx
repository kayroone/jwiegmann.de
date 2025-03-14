import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Footer from "../components/footer"

export const metadata = {
  title: "Blog | Jan Wiegmann",
  description: "Technical articles and insights on software architecture and development",
}

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-4">Blog</h1>
          <p className="text-gray-400 max-w-2xl">
            Thoughts, insights, and technical deep-dives on software architecture and development.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Active "Coming Soon" card */}
          <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors">
            <div className="p-6 flex flex-col h-full">
              <h3 className="text-xl font-semibold mb-3">Coming soon...</h3>
              <p className="text-gray-400 mb-6 flex-grow">
                Technical articles and insights on software architecture and development will be published here soon.
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                <span>Stay tuned</span>
              </div>
            </div>
          </div>

          {/* Placeholder cards (grayed out) */}
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 opacity-40">
              <div className="p-6 flex flex-col h-full">
                <div className="h-4 w-24 bg-zinc-800 rounded mb-4"></div>
                <div className="h-6 w-3/4 bg-zinc-800 rounded mb-3"></div>
                <div className="h-4 w-full bg-zinc-800 rounded mb-2"></div>
                <div className="h-4 w-5/6 bg-zinc-800 rounded mb-2"></div>
                <div className="h-4 w-4/6 bg-zinc-800 rounded mb-6"></div>
                <div className="flex items-center justify-between mt-auto">
                  <div className="h-3 w-16 bg-zinc-800 rounded"></div>
                  <div className="h-3 w-16 bg-zinc-800 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  )
}

