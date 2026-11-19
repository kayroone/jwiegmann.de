import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from "../components/footer";

export const metadata = {
  title: "Impressum | Jan Wiegmann",
  robots: { index: false },
};

export default function ImpressumPage() {
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
            Impressum
          </h1>

          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-8 space-y-4 text-gray-400 leading-relaxed">
            <div>
              <h2 className="font-semibold text-white mb-1">
                Angaben gemäß § 5 DDG
              </h2>
              <p>Jan Wiegmann</p>
              <p>Alpener Straße 368</p>
              <p>47495 Rheinberg</p>
            </div>

            <div>
              <h2 className="font-semibold text-white mb-1">Kontakt</h2>
              <p>E-Mail: jw@jwiegmann.de</p>
            </div>

            <div>
              <h2 className="font-semibold text-white mb-1">
                Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
              </h2>
              <p>Jan Wiegmann</p>
            </div>

            <div>
              <h2 className="font-semibold text-white mb-1">
                Haftungsausschluss
              </h2>
              <p>
                Die Inhalte dieser Seite wurden mit größter Sorgfalt erstellt.
                Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte
                kann jedoch keine Gewähr übernommen werden.
              </p>
              <p className="mt-2">
                Als Diensteanbieter bin ich gemäß § 7 Abs.1 TMG für eigene
                Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
                verantwortlich. Nach §§ 8 bis 10 TMG bin ich als Diensteanbieter
                jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
                Informationen zu überwachen oder nach Umständen zu forschen, die
                auf eine rechtswidrige Tätigkeit hinweisen.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
