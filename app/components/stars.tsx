"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Github, Mail, User, Rss } from "lucide-react"
import Link from "next/link"

// Feature toggles - set to true/false to enable/disable
const ENABLE_STARS = false
const ENABLE_VINES = true

/**
 * Landing page component with animated starfield background and growing pixel vines
 */
export default function Stars() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas to full window size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Particle[] = []
    const particleCount = 100
    const vines: PixelVine[] = []

    /**
     * Particle class - represents stars floating in the background
     */
    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 0.1
        this.speedX = Math.random() * 2 - 1
        this.speedY = Math.random() * 2 - 1
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        // Wrap around screen edges for infinite scrolling effect
        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    /**
     * PixelVine class - represents pixel art vines growing from bottom to top with blooming flower
     */
    class PixelVine {
      // Configuration constants
      static readonly BLOOM_HEIGHT_RATIO = 0.28   // How high vines grow (0 = top, 1 = bottom)
      static readonly WAVE_FREQUENCY = 0.02      // Sine wave frequency for vine curve
      static readonly LEAF_PROBABILITY = 0.03   // Chance per segment to spawn a leaf
      static readonly FLOWER_OFFSET_X = 10      // Horizontal offset to center flower (21x21 pattern)
      static readonly FLOWER_OFFSET_Y = 10      // Vertical offset - center flower on vine tip

      startX: number
      currentY: number
      targetY: number
      segments: { x: number; y: number; hasLeaf: boolean; leafSide: number; leafGray: number }[]
      pixelSize: number
      growSpeed: number
      isAlive: boolean
      bloomState: number // 0 = growing, 1-3 = bloom stages, 4 = fading
      bloomProgress: number
      fadeOpacity: number
      waveOffset: number
      waveAmplitude: number

      // Flower patterns (21x21) - 0=transparent, 1=gray center, 2=white petals
      // 4 cross-shaped petals with gray center - grows in 3 stages
      static flowerStages = [
        // Stage 1: Small bud
        [
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 1, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        // Stage 2: Medium - petals forming
        [
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0],
          [0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0],
          [0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 1, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0],
          [0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0],
          [0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
        // Stage 3: Full bloom - 4 cross-shaped petals
        [
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0],
          [0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0],
          [0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0],
          [0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 1, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0],
          [0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0],
          [0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0],
          [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ],
      ]

      // Leaf patterns (5x4) - more plant-like
      static leafLeft = [
        [0, 1, 1, 0, 0],
        [1, 1, 1, 1, 0],
        [0, 1, 1, 0, 0],
        [0, 0, 1, 0, 0],
      ]
      static leafRight = [
        [0, 0, 1, 1, 0],
        [0, 1, 1, 1, 1],
        [0, 0, 1, 1, 0],
        [0, 0, 1, 0, 0],
      ]

      constructor() {
        // Spawn vines only on left or right side, avoiding center text area
        const spawnOnLeft = Math.random() < 0.5
        if (spawnOnLeft) {
          this.startX = Math.random() * (canvas.width * 0.2) + canvas.width * 0.05
        } else {
          this.startX = Math.random() * (canvas.width * 0.2) + canvas.width * 0.75
        }
        this.currentY = canvas.height
        this.targetY = canvas.height * PixelVine.BLOOM_HEIGHT_RATIO
        this.segments = []
        this.pixelSize = 4
        this.growSpeed = 0.8
        this.isAlive = true
        this.bloomState = 0
        this.bloomProgress = 0
        this.fadeOpacity = 1
        this.waveOffset = Math.random() * Math.PI * 2
        this.waveAmplitude = 15 + Math.random() * 10
      }

      update() {
        if (this.bloomState === 0) {
          // Growing phase
          this.currentY -= this.growSpeed

          // Add new segment with sine-wave offset
          const waveX = Math.sin((canvas.height - this.currentY) * PixelVine.WAVE_FREQUENCY + this.waveOffset) * this.waveAmplitude
          const hasLeaf = Math.random() < PixelVine.LEAF_PROBABILITY && this.segments.length > 10
          const leafSide = Math.random() < 0.5 ? -1 : 1
          const leafGray = 100 + Math.floor(Math.random() * 100) // Random gray 100-200

          this.segments.push({
            x: this.startX + waveX,
            y: this.currentY,
            hasLeaf,
            leafSide,
            leafGray
          })

          // Start blooming when reaching target height
          if (this.currentY <= this.targetY) {
            this.bloomState = 1
          }
        } else if (this.bloomState < 4) {
          // Blooming phase
          this.bloomProgress += 0.02
          if (this.bloomProgress >= 1) {
            this.bloomProgress = 0
            this.bloomState++
          }
        } else {
          // Fading phase
          this.fadeOpacity -= 0.003
          if (this.fadeOpacity <= 0) {
            this.isAlive = false
          }
        }
      }

      draw() {
        if (!ctx) return

        // Slightly transparent base, fades further when dying
        const opacity = this.fadeOpacity * 0.2

        // Monochrome color palette
        const stemColor = `rgba(255, 255, 255, ${opacity})`        // White vine
        const flowerOpacity = Math.min(opacity * 3, this.fadeOpacity * 0.6) // Flower more visible
        const flowerCenterColor = `rgba(140, 140, 140, ${flowerOpacity})`     // Light gray center
        const flowerOuterColor = `rgba(255, 255, 255, ${flowerOpacity})`      // White petals

        // Draw vine stem
        ctx.fillStyle = stemColor
        for (const segment of this.segments) {
          // Main stem pixel
          ctx.fillRect(
            segment.x,
            segment.y,
            this.pixelSize,
            this.pixelSize
          )

          // Draw leaves with their stored gray tone (more visible than vine)
          if (segment.hasLeaf) {
            const g = segment.leafGray
            const leafOpacity = Math.min(opacity * 2.5, this.fadeOpacity * 0.5)
            ctx.fillStyle = `rgba(${g}, ${g}, ${g}, ${leafOpacity})`
            const leafPattern = segment.leafSide === -1 ? PixelVine.leafLeft : PixelVine.leafRight
            const leafOffsetX = segment.leafSide === -1 ? -this.pixelSize * 4 : this.pixelSize

            for (let row = 0; row < leafPattern.length; row++) {
              for (let col = 0; col < leafPattern[row].length; col++) {
                if (leafPattern[row][col] === 1) {
                  ctx.fillRect(
                    segment.x + leafOffsetX + col * this.pixelSize,
                    segment.y - this.pixelSize * 2 + row * this.pixelSize,
                    this.pixelSize,
                    this.pixelSize
                  )
                }
              }
            }
            ctx.fillStyle = stemColor
          }
        }

        // Draw flower if blooming (stages 1-3) or fading (stage 4 shows full bloom)
        if (this.bloomState >= 1) {
          const stageIndex = this.bloomState === 4 ? 2 : this.bloomState - 1
          this.drawFlower(ctx, stageIndex, flowerCenterColor, flowerOuterColor)
        }
      }

      private drawFlower(ctx: CanvasRenderingContext2D, stageIndex: number, centerColor: string, outerColor: string) {
        const flowerPattern = PixelVine.flowerStages[stageIndex]
        const offsetX = PixelVine.FLOWER_OFFSET_X * this.pixelSize
        const offsetY = PixelVine.FLOWER_OFFSET_Y * this.pixelSize
        const flowerX = this.segments.length > 0
          ? this.segments[this.segments.length - 1].x - offsetX
          : this.startX - offsetX
        const flowerY = this.targetY - offsetY

        for (let row = 0; row < flowerPattern.length; row++) {
          for (let col = 0; col < flowerPattern[row].length; col++) {
            const pixel = flowerPattern[row][col]
            if (pixel === 1) {
              ctx.fillStyle = centerColor
              ctx.fillRect(flowerX + col * this.pixelSize, flowerY + row * this.pixelSize, this.pixelSize, this.pixelSize)
            } else if (pixel === 2) {
              ctx.fillStyle = outerColor
              ctx.fillRect(flowerX + col * this.pixelSize, flowerY + row * this.pixelSize, this.pixelSize, this.pixelSize)
            }
          }
        }
      }
    }

    // Initialize background particles (stars)
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Vine spawn timing
    let lastVineSpawn = Date.now() - 8000 // Offset so first spawns quickly
    const vineSpawnInterval = 6000 // New vine every 6 seconds
    const maxVines = 2 // Maximum concurrent vines

    /**
     * Main animation loop - runs continuously via requestAnimationFrame
     */
    function animate() {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn new vine periodically (max 2 at a time)
      if (ENABLE_VINES) {
        const now = Date.now()
        if (now - lastVineSpawn > vineSpawnInterval && vines.length < maxVines) {
          vines.push(new PixelVine())
          lastVineSpawn = now
        }
      }

      // Draw stars if enabled
      if (ENABLE_STARS) {
        for (const particle of particles) {
          particle.update()
          particle.draw()
        }
      }

      // Draw vines if enabled (iterate backwards for safe removal)
      if (ENABLE_VINES) {
        for (let i = vines.length - 1; i >= 0; i--) {
          const vine = vines[i]
          vine.update()
          vine.draw()

          // Remove vines that have faded out
          if (!vine.isAlive) {
            vines.splice(i, 1)
          }
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    // Handle window resize to keep canvas full-screen
    const handleResize = () => {
      if (!canvasRef.current) return
      canvasRef.current.width = window.innerWidth
      canvasRef.current.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    // Cleanup: remove event listener when component unmounts
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full bg-black" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <motion.h1
          className="mb-6 text-6xl font-bold tracking-tighter sm:text-7xl lg:text-8xl relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          JAN WIEGMANN
        </motion.h1>
        <motion.p
          className="max-w-[600px] text-lg text-gray-400 sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Software Architect
        </motion.p>
        <motion.div
          className="mt-6 flex gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <a
            href="https://github.com/kayroone"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-white transition-colors hover:bg-zinc-700"
          >
            <Github size={20} />
          </a>
          <div className="relative">
            <div
              className="flex h-10 w-10 cursor-default items-center justify-center rounded-full bg-zinc-800 text-white transition-colors hover:bg-zinc-700"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Mail size={20} />
            </div>
            {showTooltip && (
              <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded bg-zinc-800 px-3 py-1 text-sm text-white">
                jw@jwiegmann.de
              </div>
            )}
          </div>
          <a
            href="/feed.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-white transition-colors hover:bg-zinc-700"
            aria-label="RSS Feed abonnieren"
          >
            <Rss size={20} />
          </a>
          <Link
            href="/about"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-white transition-colors hover:bg-zinc-700"
          >
            <User size={20} />
          </Link>
          <Link
            href="/blog"
            className="flex h-10 items-center justify-center rounded-full bg-zinc-800 px-4 text-white transition-colors hover:bg-zinc-700"
          >
            Blog
          </Link>
        </motion.div>
      </div>
    </div>
  )
}