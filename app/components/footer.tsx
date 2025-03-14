import { ImpressumModal } from "./impressum-modal"

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-black py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 text-center">
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Jan Wiegmann. All rights reserved.</p>
          <span className="hidden sm:inline text-gray-600">//</span>
          <ImpressumModal />
        </div>
      </div>
    </footer>
  )
}

