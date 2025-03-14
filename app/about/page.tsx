import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Footer from "../components/footer"

export const metadata = {
  title: "About Me | Jan Wiegmann",
  description: "Learn more about Jan Wiegmann, Software Architect",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>

        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-8">About Me</h1>

          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Coming soon...</h2>
            <p className="text-gray-400">
              This page is currently under construction. Check back soon to learn more about my background, experience,
              and expertise in software architecture and development.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

