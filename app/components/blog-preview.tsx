"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useRef } from "react"
import { useInView } from "framer-motion"

export default function BlogPreview() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section className="py-20 bg-black">
      <div ref={ref} className="container mx-auto px-4">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">Blog</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Thoughts, insights, and technical deep-dives on software architecture and development.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Active "Coming Soon" card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8 }}
            className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            <Link href={`/blog`} className="block h-full">
              <div className="p-6 flex flex-col h-full">
                <h3 className="text-xl font-semibold mb-3">Coming soon...</h3>
                <p className="text-gray-400 mb-6 flex-grow">
                  Technical articles and insights on software architecture and development will be published here soon.
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                  <span>Stay tuned</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Placeholder cards (grayed out) */}
          {[1, 2].map((index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 0.4, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800"
            >
              <div className="p-6 flex flex-col h-full opacity-50">
                <div className="h-4 w-24 bg-zinc-800 rounded mb-4"></div>
                <div className="h-6 w-3/4 bg-zinc-800 rounded mb-3"></div>
                <div className="h-4 w-full bg-zinc-800 rounded mb-2"></div>
                <div className="h-4 w-5/6 bg-zinc-800 rounded mb-2"></div>
                <div className="h-4 w-4/6 bg-zinc-800 rounded mb-6"></div>
                <div className="flex items-center justify-between mt-auto">
                  <div className="h-3 w-16 bg-zinc-800 rounded"></div>
                  <div className="h-3 w-16 bg-zinc-800 rounded"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
          >
            View blog
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

