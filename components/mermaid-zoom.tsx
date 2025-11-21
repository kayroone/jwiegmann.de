"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

/**
 * Client-side component that makes Mermaid diagrams clickable and zoomable
 * Adds click handlers to open diagrams in a full-screen modal
 */
export default function MermaidZoom() {
  const [isOpen, setIsOpen] = useState(false)
  const [diagramSvg, setDiagramSvg] = useState<string>("")

  useEffect(() => {
    // Find all rendered Mermaid diagrams
    const mermaidContainers = document.querySelectorAll(".mermaid-container")

    mermaidContainers.forEach((container) => {
      const mermaidDiv = container.querySelector(".mermaid svg")

      if (mermaidDiv) {
        // Make container clickable
        const containerEl = container as HTMLElement
        containerEl.style.cursor = "pointer"
        containerEl.title = "Klicken zum Vergrößern"

        // Add click handler
        containerEl.onclick = () => {
          // Get the rendered SVG
          const svgElement = mermaidDiv as SVGElement
          const svgClone = svgElement.cloneNode(true) as SVGElement

          // Make SVG responsive in modal
          const isMobile = window.innerWidth < 768

          if (isMobile) {
            // Mobile: Make SVG fully responsive, no fixed size
            svgClone.removeAttribute("width")
            svgClone.removeAttribute("height")
            svgClone.style.width = "100%"
            svgClone.style.height = "auto"
            svgClone.style.maxWidth = "100%"
          } else {
            // Desktop: Scale up 1.3x
            const originalWidth = svgClone.viewBox.baseVal.width || 800
            const originalHeight = svgClone.viewBox.baseVal.height || 600
            const scaledWidth = originalWidth * 1.3
            const scaledHeight = originalHeight * 1.3

            svgClone.setAttribute("width", scaledWidth.toString())
            svgClone.setAttribute("height", scaledHeight.toString())
            svgClone.style.maxWidth = "100%"
            svgClone.style.height = "auto"
          }

          setDiagramSvg(svgClone.outerHTML)
          setIsOpen(true)
        }
      }
    })
  }, [])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-8"
      onClick={() => setIsOpen(false)}
    >
      <button
        className="absolute top-2 right-2 md:top-4 md:right-4 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors z-10"
        onClick={() => setIsOpen(false)}
        aria-label="Schließen"
      >
        <X size={20} className="text-white md:w-6 md:h-6" />
      </button>
      <div
        className="bg-zinc-900 rounded-lg p-4 md:p-8 overflow-auto max-w-[95vw] max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div dangerouslySetInnerHTML={{ __html: diagramSvg }} />
      </div>
    </div>
  )
}
