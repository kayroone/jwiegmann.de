"use client"

import { useEffect } from "react"
import mermaid from "mermaid"

/**
 * Client-side component that renders Mermaid diagrams in blog posts
 * Finds all <code class="language-mermaid"> blocks and converts them to SVG
 */
export default function MermaidRenderer() {
  useEffect(() => {
    // Initialize Mermaid with configuration
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        darkMode: true,
        background: "#000000",
        primaryColor: "#3b82f6",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#6b7280",
        lineColor: "#9ca3af",
        secondaryColor: "#1f2937",
        tertiaryColor: "#374151",
      },
    })

    // Find all code blocks with language-mermaid class
    const mermaidBlocks = document.querySelectorAll("pre code.language-mermaid")

    mermaidBlocks.forEach((block, index) => {
      const code = block.textContent || ""
      const pre = block.parentElement

      if (pre) {
        // Create a container for the Mermaid diagram
        const container = document.createElement("div")
        container.className = "mermaid-container"
        container.style.cssText = "background: #0a0a0a; padding: 2rem; border-radius: 0.5rem; margin: 1.5rem 0;"

        // Create mermaid element
        const mermaidDiv = document.createElement("div")
        mermaidDiv.className = "mermaid"
        mermaidDiv.textContent = code
        mermaidDiv.id = `mermaid-${index}`

        container.appendChild(mermaidDiv)

        // Replace the pre element with the container
        pre.replaceWith(container)
      }
    })

    // Render all Mermaid diagrams
    mermaid.run({
      querySelector: ".mermaid",
    })
  }, [])

  return null
}
