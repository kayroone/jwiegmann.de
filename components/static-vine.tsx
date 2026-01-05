"use client"

import { useEffect, useRef } from "react"

/**
 * Static decorative vine for blog article pages
 * Creates a subtle visual connection to the main landing page
 */
export default function StaticVine() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 200
    canvas.height = window.innerHeight

    const pixelSize = 3
    const baseOpacity = 0.12 // Lower opacity than main page
    const leafOpacity = 0.25
    const flowerOpacity = 0.35

    // Draw vine stem with sine wave - positioned more towards center
    const startX = 40
    const segments: { x: number; y: number; hasLeaf: boolean; leafSide: number; leafGray: number }[] = []

    // Generate vine path
    for (let y = canvas.height; y > canvas.height * 0.25; y -= 2) {
      const waveX = Math.sin((canvas.height - y) * 0.015) * 20
      const hasLeaf = Math.random() < 0.06 && y < canvas.height - 80 && y > canvas.height * 0.3
      segments.push({
        x: startX + waveX,
        y,
        hasLeaf,
        leafSide: Math.random() < 0.5 ? -1 : 1,
        leafGray: 100 + Math.floor(Math.random() * 100)
      })
    }

    // Draw stem
    ctx.fillStyle = `rgba(255, 255, 255, ${baseOpacity})`
    for (const segment of segments) {
      ctx.fillRect(segment.x, segment.y, pixelSize, pixelSize)
    }

    // Leaf patterns
    const leafLeft = [
      [0, 1, 1, 0, 0],
      [1, 1, 1, 1, 0],
      [0, 1, 1, 0, 0],
      [0, 0, 1, 0, 0],
    ]
    const leafRight = [
      [0, 0, 1, 1, 0],
      [0, 1, 1, 1, 1],
      [0, 0, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ]

    // Draw leaves
    for (const segment of segments) {
      if (segment.hasLeaf) {
        const g = segment.leafGray
        ctx.fillStyle = `rgba(${g}, ${g}, ${g}, ${leafOpacity})`
        const leafPattern = segment.leafSide === -1 ? leafLeft : leafRight
        const leafOffsetX = segment.leafSide === -1 ? -pixelSize * 4 : pixelSize

        for (let row = 0; row < leafPattern.length; row++) {
          for (let col = 0; col < leafPattern[row].length; col++) {
            if (leafPattern[row][col] === 1) {
              ctx.fillRect(
                segment.x + leafOffsetX + col * pixelSize,
                segment.y - pixelSize * 2 + row * pixelSize,
                pixelSize,
                pixelSize
              )
            }
          }
        }
      }
    }

    // Flower pattern (simplified 15x15 version)
    const flowerPattern = [
      [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0],
      [0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0],
      [2, 2, 2, 2, 2, 0, 0, 1, 0, 0, 2, 2, 2, 2, 2],
      [0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0],
      [0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0],
    ]

    // Draw flower at top of vine
    const lastSegment = segments[segments.length - 1]
    const flowerX = lastSegment.x - 7 * pixelSize
    const flowerY = lastSegment.y - 7 * pixelSize

    for (let row = 0; row < flowerPattern.length; row++) {
      for (let col = 0; col < flowerPattern[row].length; col++) {
        const pixel = flowerPattern[row][col]
        if (pixel === 1) {
          ctx.fillStyle = `rgba(140, 140, 140, ${flowerOpacity})`
          ctx.fillRect(flowerX + col * pixelSize, flowerY + row * pixelSize, pixelSize, pixelSize)
        } else if (pixel === 2) {
          ctx.fillStyle = `rgba(255, 255, 255, ${flowerOpacity})`
          ctx.fillRect(flowerX + col * pixelSize, flowerY + row * pixelSize, pixelSize, pixelSize)
        }
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed right-0 top-0 h-full pointer-events-none z-0"
      style={{ width: '200px' }}
    />
  )
}
