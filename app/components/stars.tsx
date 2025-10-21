"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Github, Mail, User } from "lucide-react"
import Link from "next/link"

export default function Stars() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Particle[] = []
    const particleCount = 100
    const invaders: SpaceInvader[] = []

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

    class SpaceInvader {
      x: number
      y: number
      size: number
      speed: number
      type: number
      isAlive: boolean

      // Classic Space Invader pixel patterns (11x8)
      static patterns = [
        // Type 1
        [
          [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
          [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
          [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
          [0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
          [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
          [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0],
        ],
        // Type 2
        [
          [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0],
          [0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0],
          [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        ],
        // Type 3
        [
          [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0],
          [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
          [1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
          [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
          [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
        ],
      ]

      constructor() {
        this.x = Math.random() * (canvas.width - 44) + 22
        this.y = canvas.height + 20
        this.size = 4 // pixel size
        this.speed = 0.5 + Math.random() * 0.5
        this.type = Math.floor(Math.random() * SpaceInvader.patterns.length)
        this.isAlive = true
      }

      update() {
        this.y -= this.speed

        if (this.y < -40) {
          this.isAlive = false
        }
      }

      draw() {
        if (!ctx) return
        const pattern = SpaceInvader.patterns[this.type]

        ctx.fillStyle = "rgba(255, 255, 255, 1)"

        for (let row = 0; row < pattern.length; row++) {
          for (let col = 0; col < pattern[row].length; col++) {
            if (pattern[row][col] === 1) {
              ctx.fillRect(
                this.x + col * this.size,
                this.y + row * this.size,
                this.size,
                this.size
              )
            }
          }
        }
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Spawn invaders periodically
    let lastInvaderSpawn = Date.now() - 4000 // Start with offset so first invader spawns immediately
    const invaderSpawnInterval = 4000 // spawn every 4 seconds

    function animate() {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn new invader
      const now = Date.now()
      if (now - lastInvaderSpawn > invaderSpawnInterval) {
        invaders.push(new SpaceInvader())
        lastInvaderSpawn = now
      }

      // Update and draw particles
      for (const particle of particles) {
        particle.update()
        particle.draw()
      }

      // Update and draw invaders
      for (let i = invaders.length - 1; i >= 0; i--) {
        const invader = invaders[i]
        invader.update()
        invader.draw()

        // Remove dead invaders
        if (!invader.isAlive) {
          invaders.splice(i, 1)
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      if (!canvasRef.current) return
      canvasRef.current.width = window.innerWidth
      canvasRef.current.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full bg-black" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <motion.h1
          className="mb-6 text-6xl font-bold tracking-tighter sm:text-7xl lg:text-8xl"
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