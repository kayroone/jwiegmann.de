import "@/styles/globals.css"
import "highlight.js/styles/tokyo-night-dark.css"
import { Inter } from "next/font/google"
import type React from "react"
import type { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://jwiegmann.de"),
  title: "Jan Wiegmann | Software Architect",
  description: "Jan Wiegmann - Software Architect at adesso SE. Specializing in innovative and sustainable solutions in the public sector, insurance, and government modernization.",
  keywords: ["Jan Wiegmann", "Software Architect", "adesso", "adesso SE", "Software Engineer", "Public Sector", "Government Modernization", "Business Informatics"],
  authors: [{ name: "Jan Wiegmann" }],
  creator: "Jan Wiegmann",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jwiegmann.de",
    title: "Jan Wiegmann | Software Architect",
    description: "Software Architect at adesso SE specializing in innovative and sustainable solutions",
    siteName: "Jan Wiegmann",
    images: [
      {
        url: "/images/about-portrait.jpg",
        width: 2048,
        height: 1942,
        alt: "Portrait of Jan Wiegmann leaning on a railing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jan Wiegmann | Software Architect",
    description: "Software Architect at adesso SE specializing in innovative and sustainable solutions",
    images: ["/images/about-portrait.jpg"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
