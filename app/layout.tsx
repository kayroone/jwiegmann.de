import "@/styles/globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import type { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
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
  },
  twitter: {
    card: "summary",
    title: "Jan Wiegmann | Software Architect",
    description: "Software Architect at adesso SE specializing in innovative and sustainable solutions",
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