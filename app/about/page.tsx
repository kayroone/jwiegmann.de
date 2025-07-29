import Link from "next/link"
import Image from "next/image"
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

          <div className="max-w-3xl mx-auto space-y-12">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">About Me</h1>

            <div className="flex justify-center">
              <div className="relative w-72 h-72 rounded-full overflow-hidden border-4 border-zinc-700">
                <Image
                    src="/images/about-portrait.jpg"
                    alt="Portrait von Jan Wiegmann"
                    fill
                    className="object-cover object-center transform scale-150"
                    priority
                />
              </div>
            </div>

            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-8">
              <p className="text-gray-400 leading-relaxed">
                I grew up in the idyllic village of Sevelen near the Dutch border, but moved to Duisburg to study business informatics at FOM/VWA. I lived there in the inner harbor for almost seven years, made great friends, and learned a lot. For over a decade, I worked as a software engineer on exciting projects in the fields of insurance and government modernization. For more than a year now, I have been designing innovative and sustainable solutions in the public sector as a software architect at adesso SE. Away from coding, I am a passionate technology fan, anime enthusiast, husband, and proud dad.</p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
  )
}
