export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-black py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Jan Wiegmann. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

