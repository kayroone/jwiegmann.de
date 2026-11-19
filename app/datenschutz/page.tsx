import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from "../components/footer";

export const metadata = {
  title: "Datenschutz | Jan Wiegmann",
  robots: { index: false },
};

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Zurück zur Startseite
          </Link>
        </div>

        <div className="max-w-3xl mx-auto space-y-12">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
            Datenschutz
          </h1>

          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-8">
            <p className="text-gray-400 leading-relaxed">Text folgt</p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
