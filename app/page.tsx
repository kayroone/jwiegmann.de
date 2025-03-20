import MainPage from "./components/hero"
import BlogPreview from "./components/blog-preview"
import Footer from "./components/footer"

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <MainPage />
      <BlogPreview />
      <Footer />
    </main>
  )
}

