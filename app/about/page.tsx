import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import Footer from "../components/footer"

export const metadata = {
  title: "Über mich | Jan Wiegmann",
  description: "Jan Wiegmann - Software Architect bei adesso SE mit über einem Jahrzehnt Erfahrung in der Softwareentwicklung. Spezialisiert auf öffentlichen Sektor, Versicherungen und Behördenmodernisierung.",
  keywords: ["Jan Wiegmann", "adesso SE", "Software Architect", "Software Engineer", "Öffentlicher Sektor", "Behördenmodernisierung", "Versicherungen", "Wirtschaftsinformatik", "Duisburg", "FOM"],
}

export default function AboutPage() {
  return (
      <main className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={16} />
              Zurück zur Startseite
            </Link>
          </div>

          <div className="max-w-3xl mx-auto space-y-12">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Über mich</h1>

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
                Aufgewachsen bin ich in dem idyllischen Örtchen Sevelen nahe der niederländischen Grenze, zog jedoch nach Duisburg, um an der FOM/VWA Wirtschaftsinformatik zu studieren. Dort habe ich fast sieben Jahre im Innenhafen gelebt, tolle Freunde gefunden und viel gelernt. Über ein Jahrzehnt lang arbeitete ich als Software Engineer an spannenden Projekten im Versicherungswesen und der Behördenmodernisierung. Seit gut einem Jahr gestalte ich als Software Architect bei adesso SE innovative und nachhaltige Lösungen im öffentlichen Sektor. Fernab vom Coden bin ich leidenschaftlicher Technik-Fan, Anime-Enthusiast, Ehemann und stolzer Papa.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
  )
}
