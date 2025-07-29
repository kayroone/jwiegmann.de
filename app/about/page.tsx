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
                Aufgewachsen im idyllischen Sevelen, zog es mich nach Duisburg, um Wirtschaftsinformatik an der FOM zu studieren - dort habe ich knapp 7 Jahre im Innenhafen gewohnt, tolle Freunde gefunden und viel dazugelernt. Über ein Jahrzehnt habe ich als Softwareentwickler spannende Projekte in den Bereichen Versicherungen und Staatsmodernisierung realisiert. Seit mehr als einem Jahr gestalte ich nun als Softwarearchitekt bei adesso SE innovative und nachhaltige Lösungen ebenfalls im Public-Bereich. Abseits des Codes bin ich ein leidenschaftlicher Technikfan, Anime-Enthusiast, Ehemann und stolzer Papa.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
  )
}
