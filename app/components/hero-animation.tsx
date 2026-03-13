"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Github, Mail, User, Rss } from "lucide-react";
import Link from "next/link";

// Feature toggles - set to true/false to enable/disable
const ENABLE_STARS = false;
const ENABLE_VINES = false;
const ENABLE_SPRING_THEME = true;

// Shared pixel art configuration
export const PIXEL_SIZE = 4;

/**
 * PixelSun - pixel art sun with radial color gradient and animated rays
 * Positioned above the heading at canvas.height * 0.18
 */
export class PixelSun {
  centerX: number;
  centerY: number;
  bodyRadius: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.centerX = canvasWidth / 2;
    this.centerY = canvasHeight * 0.18;
    this.bodyRadius = 40;
  }

  reposition(canvasWidth: number, canvasHeight: number) {
    this.centerX = canvasWidth / 2;
    this.centerY = canvasHeight * 0.18;
  }

  getBodyPixels(): { x: number; y: number; dist: number }[] {
    const pixels: { x: number; y: number; dist: number }[] = [];
    const gridRadius = Math.ceil(this.bodyRadius / PIXEL_SIZE);

    for (let gx = -gridRadius; gx <= gridRadius; gx++) {
      for (let gy = -gridRadius; gy <= gridRadius; gy++) {
        const px =
          Math.round(this.centerX / PIXEL_SIZE) * PIXEL_SIZE + gx * PIXEL_SIZE;
        const py =
          Math.round(this.centerY / PIXEL_SIZE) * PIXEL_SIZE + gy * PIXEL_SIZE;
        const cx = px + PIXEL_SIZE / 2;
        const cy = py + PIXEL_SIZE / 2;
        const dist = Math.sqrt(
          (cx - this.centerX) ** 2 + (cy - this.centerY) ** 2,
        );
        if (dist <= this.bodyRadius) {
          pixels.push({ x: px, y: py, dist });
        }
      }
    }

    return pixels;
  }

  getColorAtDistance(dist: number): { r: number; g: number; b: number } {
    const t = Math.min(dist / this.bodyRadius, 1);
    // Orange (255, 140, 0) at center → Yellow (255, 255, 0) at edge
    return {
      r: 255,
      g: Math.round(140 + (255 - 140) * t),
      b: 0,
    };
  }

  static readonly RAY_COUNT = 12;
  static readonly RAY_LENGTH = 25;

  getRayPixels(): {
    angle: number;
    length: number;
    index: number;
    pixels: { x: number; y: number }[];
  }[] {
    const rays: {
      angle: number;
      length: number;
      index: number;
      pixels: { x: number; y: number }[];
    }[] = [];

    for (let i = 0; i < PixelSun.RAY_COUNT; i++) {
      const angle = (i * Math.PI * 2) / PixelSun.RAY_COUNT;
      const length = PixelSun.RAY_LENGTH;

      const pixels: { x: number; y: number }[] = [];
      const steps = Math.ceil(length / PIXEL_SIZE);

      for (let s = 0; s <= steps; s++) {
        const dist = this.bodyRadius + s * PIXEL_SIZE;
        if (dist > this.bodyRadius + length) break;
        const px =
          Math.round((this.centerX + Math.cos(angle) * dist) / PIXEL_SIZE) *
          PIXEL_SIZE;
        const py =
          Math.round((this.centerY + Math.sin(angle) * dist) / PIXEL_SIZE) *
          PIXEL_SIZE;
        pixels.push({ x: px, y: py });
      }

      rays.push({ angle, length, index: i, pixels });
    }

    return rays;
  }

  getRayGlow(
    rayIndex: number,
    time: number,
  ): { r: number; g: number; b: number; brightness: number } {
    // Each ray pulses independently between dim and bright
    const pulse = Math.sin(time * 0.6 + rayIndex * 1.3) * 0.5 + 0.5;
    return {
      r: 255,
      g: Math.round(180 + pulse * 75),
      b: 0,
      brightness: 0.25 + pulse * 0.75,
    };
  }

  draw(ctx: CanvasRenderingContext2D, time: number) {
    // Draw body with radial gradient
    const bodyPixels = this.getBodyPixels();
    for (const pixel of bodyPixels) {
      const color = this.getColorAtDistance(pixel.dist);
      ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
      ctx.fillRect(pixel.x, pixel.y, PIXEL_SIZE, PIXEL_SIZE);
    }

    // Draw rays with glow pulse and fading opacity
    const rays = this.getRayPixels();
    for (const ray of rays) {
      const glow = this.getRayGlow(ray.index, time);
      for (let i = 0; i < ray.pixels.length; i++) {
        const pixel = ray.pixels[i];
        const rayProgress = i / Math.max(ray.pixels.length - 1, 1);
        const fadeOut = 1 - rayProgress * 0.7;
        const opacity = glow.brightness * fadeOut;
        ctx.fillStyle = `rgba(${glow.r}, ${glow.g}, ${glow.b}, ${opacity})`;
        ctx.fillRect(pixel.x, pixel.y, PIXEL_SIZE, PIXEL_SIZE);
      }
    }
  }
}

export interface GrassBlade {
  x: number;
  baseY: number;
  height: number;
  width: number;
  phaseOffset: number;
}

/**
 * PixelGrass - pixel art grass blades anchored at the bottom with wind animation
 */
export class PixelGrass {
  blades: GrassBlade[];

  constructor(canvasWidth: number, canvasHeight: number) {
    this.blades = [];
    this.generateBlades(canvasWidth, canvasHeight);
  }

  regenerate(canvasWidth: number, canvasHeight: number) {
    this.blades = [];
    this.generateBlades(canvasWidth, canvasHeight);
  }

  private generateBlades(canvasWidth: number, canvasHeight: number) {
    const maxGap = 20;
    const bladeCount = Math.ceil(canvasWidth / maxGap);

    for (let i = 0; i < bladeCount; i++) {
      const x =
        Math.round((i * canvasWidth) / bladeCount / PIXEL_SIZE) * PIXEL_SIZE;
      const minSegments = Math.ceil(20 / PIXEL_SIZE);
      const maxSegments = Math.floor(80 / PIXEL_SIZE);
      const segments =
        minSegments +
        Math.floor(Math.random() * (maxSegments - minSegments + 1));
      const height = segments * PIXEL_SIZE;
      const width = Math.random() < 0.5 ? PIXEL_SIZE : PIXEL_SIZE * 2;

      this.blades.push({
        x,
        baseY: canvasHeight,
        height,
        width,
        phaseOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  getBladeDisplacement(
    blade: GrassBlade,
    segmentIndex: number,
    totalSegments: number,
    time: number,
  ): number {
    // Wind bias: Math.sin(t) - 0.3 → predominantly left
    const wind = Math.sin(time * 0.8 + blade.phaseOffset) - 0.3;
    // Displacement increases from base (0) to tip (1)
    const heightFactor = segmentIndex / Math.max(totalSegments - 1, 1);
    const maxDisplacement = 12;
    return wind * heightFactor * heightFactor * maxDisplacement;
  }

  draw(ctx: CanvasRenderingContext2D, time: number) {
    for (const blade of this.blades) {
      const segments = Math.round(blade.height / PIXEL_SIZE);

      // Darker green at base, lighter at tip
      for (let s = 0; s < segments; s++) {
        const heightFactor = s / Math.max(segments - 1, 1);
        const g = Math.round(100 + heightFactor * 80);
        const displacement = this.getBladeDisplacement(
          blade,
          s,
          segments,
          time,
        );

        const px =
          Math.round((blade.x + displacement) / PIXEL_SIZE) * PIXEL_SIZE;
        const py = blade.baseY - (s + 1) * PIXEL_SIZE;

        ctx.fillStyle = `rgb(34, ${g}, 34)`;
        ctx.fillRect(px, py, blade.width, PIXEL_SIZE);
      }
    }
  }
}

/**
 * Landing page with pixel art spring theme (sun + grass) and optional starfield/vine animations
 */
export default function Stars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas to match the actual container size (dvh-aware)
    const container = canvas.parentElement;
    canvas.width = container?.clientWidth ?? window.innerWidth;
    canvas.height = container?.clientHeight ?? window.innerHeight;

    const particles: Particle[] = [];
    const particleCount = 100;
    const vines: PixelVine[] = [];

    // Spring theme elements
    let sun: PixelSun | null = null;
    let grass: PixelGrass | null = null;
    if (ENABLE_SPRING_THEME) {
      sun = new PixelSun(canvas.width, canvas.height);
      grass = new PixelGrass(canvas.width, canvas.height);
    }

    /**
     * Particle class - represents stars floating in the background
     */
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /**
     * PixelVine class - represents pixel art vines growing from bottom to top with blooming flower
     */
    class PixelVine {
      static readonly BLOOM_HEIGHT_RATIO = 0.28;
      static readonly WAVE_FREQUENCY = 0.02;
      static readonly LEAF_PROBABILITY = 0.03;
      static readonly FLOWER_OFFSET_X = 10;
      static readonly FLOWER_OFFSET_Y = 10;

      startX: number;
      currentY: number;
      targetY: number;
      segments: {
        x: number;
        y: number;
        hasLeaf: boolean;
        leafSide: number;
        leafGray: number;
      }[];
      growSpeed: number;
      isAlive: boolean;
      bloomState: number;
      bloomProgress: number;
      fadeOpacity: number;
      waveOffset: number;
      waveAmplitude: number;

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
      ];

      static leafLeft = [
        [0, 1, 1, 0, 0],
        [1, 1, 1, 1, 0],
        [0, 1, 1, 0, 0],
        [0, 0, 1, 0, 0],
      ];
      static leafRight = [
        [0, 0, 1, 1, 0],
        [0, 1, 1, 1, 1],
        [0, 0, 1, 1, 0],
        [0, 0, 1, 0, 0],
      ];

      constructor() {
        const spawnOnLeft = Math.random() < 0.5;
        if (spawnOnLeft) {
          this.startX =
            Math.random() * (canvas.width * 0.2) + canvas.width * 0.05;
        } else {
          this.startX =
            Math.random() * (canvas.width * 0.2) + canvas.width * 0.75;
        }
        this.currentY = canvas.height;
        this.targetY = canvas.height * PixelVine.BLOOM_HEIGHT_RATIO;
        this.segments = [];
        this.growSpeed = 0.8;
        this.isAlive = true;
        this.bloomState = 0;
        this.bloomProgress = 0;
        this.fadeOpacity = 1;
        this.waveOffset = Math.random() * Math.PI * 2;
        this.waveAmplitude = 15 + Math.random() * 10;
      }

      update() {
        if (this.bloomState === 0) {
          this.currentY -= this.growSpeed;

          const waveX =
            Math.sin(
              (canvas.height - this.currentY) * PixelVine.WAVE_FREQUENCY +
                this.waveOffset,
            ) * this.waveAmplitude;
          const hasLeaf =
            Math.random() < PixelVine.LEAF_PROBABILITY &&
            this.segments.length > 10;
          const leafSide = Math.random() < 0.5 ? -1 : 1;
          const leafGray = 100 + Math.floor(Math.random() * 100);

          this.segments.push({
            x: this.startX + waveX,
            y: this.currentY,
            hasLeaf,
            leafSide,
            leafGray,
          });

          if (this.currentY <= this.targetY) {
            this.bloomState = 1;
          }
        } else if (this.bloomState < 4) {
          this.bloomProgress += 0.02;
          if (this.bloomProgress >= 1) {
            this.bloomProgress = 0;
            this.bloomState++;
          }
        } else {
          this.fadeOpacity -= 0.003;
          if (this.fadeOpacity <= 0) {
            this.isAlive = false;
          }
        }
      }

      draw() {
        if (!ctx) return;

        const opacity = this.fadeOpacity * 0.2;

        const stemColor = `rgba(255, 255, 255, ${opacity})`;
        const flowerOpacity = Math.min(opacity * 3, this.fadeOpacity * 0.6);
        const flowerCenterColor = `rgba(140, 140, 140, ${flowerOpacity})`;
        const flowerOuterColor = `rgba(255, 255, 255, ${flowerOpacity})`;

        ctx.fillStyle = stemColor;
        for (const segment of this.segments) {
          ctx.fillRect(segment.x, segment.y, PIXEL_SIZE, PIXEL_SIZE);

          if (segment.hasLeaf) {
            const g = segment.leafGray;
            const leafOpacity = Math.min(opacity * 2.5, this.fadeOpacity * 0.5);
            ctx.fillStyle = `rgba(${g}, ${g}, ${g}, ${leafOpacity})`;
            const leafPattern =
              segment.leafSide === -1
                ? PixelVine.leafLeft
                : PixelVine.leafRight;
            const leafOffsetX =
              segment.leafSide === -1 ? -PIXEL_SIZE * 4 : PIXEL_SIZE;

            for (let row = 0; row < leafPattern.length; row++) {
              for (let col = 0; col < leafPattern[row].length; col++) {
                if (leafPattern[row][col] === 1) {
                  ctx.fillRect(
                    segment.x + leafOffsetX + col * PIXEL_SIZE,
                    segment.y - PIXEL_SIZE * 2 + row * PIXEL_SIZE,
                    PIXEL_SIZE,
                    PIXEL_SIZE,
                  );
                }
              }
            }
            ctx.fillStyle = stemColor;
          }
        }

        if (this.bloomState >= 1) {
          const stageIndex = this.bloomState === 4 ? 2 : this.bloomState - 1;
          this.drawFlower(ctx, stageIndex, flowerCenterColor, flowerOuterColor);
        }
      }

      private drawFlower(
        ctx: CanvasRenderingContext2D,
        stageIndex: number,
        centerColor: string,
        outerColor: string,
      ) {
        const flowerPattern = PixelVine.flowerStages[stageIndex];
        const offsetX = PixelVine.FLOWER_OFFSET_X * PIXEL_SIZE;
        const offsetY = PixelVine.FLOWER_OFFSET_Y * PIXEL_SIZE;
        const flowerX =
          this.segments.length > 0
            ? this.segments[this.segments.length - 1].x - offsetX
            : this.startX - offsetX;
        const flowerY = this.targetY - offsetY;

        for (let row = 0; row < flowerPattern.length; row++) {
          for (let col = 0; col < flowerPattern[row].length; col++) {
            const pixel = flowerPattern[row][col];
            if (pixel === 1) {
              ctx.fillStyle = centerColor;
              ctx.fillRect(
                flowerX + col * PIXEL_SIZE,
                flowerY + row * PIXEL_SIZE,
                PIXEL_SIZE,
                PIXEL_SIZE,
              );
            } else if (pixel === 2) {
              ctx.fillStyle = outerColor;
              ctx.fillRect(
                flowerX + col * PIXEL_SIZE,
                flowerY + row * PIXEL_SIZE,
                PIXEL_SIZE,
                PIXEL_SIZE,
              );
            }
          }
        }
      }
    }

    // Initialize background particles (stars)
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Vine spawn timing
    let lastVineSpawn = Date.now() - 8000;
    const vineSpawnInterval = 6000;
    const maxVines = 2;

    /**
     * Main animation loop - runs continuously via requestAnimationFrame
     */
    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = performance.now() * 0.0008;

      // Spawn new vine periodically (only if vines enabled AND spring theme is off)
      if (ENABLE_VINES && !ENABLE_SPRING_THEME) {
        const now = Date.now();
        if (
          now - lastVineSpawn > vineSpawnInterval &&
          vines.length < maxVines
        ) {
          vines.push(new PixelVine());
          lastVineSpawn = now;
        }
      }

      // Draw stars if enabled
      if (ENABLE_STARS) {
        for (const particle of particles) {
          particle.update();
          particle.draw();
        }
      }

      // Draw vines if enabled (and spring theme is off)
      if (ENABLE_VINES && !ENABLE_SPRING_THEME) {
        for (let i = vines.length - 1; i >= 0; i--) {
          const vine = vines[i];
          vine.update();
          vine.draw();

          if (!vine.isAlive) {
            vines.splice(i, 1);
          }
        }
      }

      // Draw spring theme elements: grass first, then sun on top
      if (ENABLE_SPRING_THEME) {
        if (grass) {
          grass.draw(ctx, time);
        }
        if (sun) {
          sun.draw(ctx, time);
        }
      }

      animationId = requestAnimationFrame(animate);
    }

    let animationId = requestAnimationFrame(animate);

    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      const c = canvasRef.current;
      const parent = c.parentElement;
      c.width = parent?.clientWidth ?? window.innerWidth;
      c.height = parent?.clientHeight ?? window.innerHeight;

      // Reposition/regenerate spring elements
      if (ENABLE_SPRING_THEME) {
        if (sun) {
          sun.reposition(c.width, c.height);
        }
        if (grass) {
          grass.regenerate(c.width, c.height);
        }
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const subtextColor = "text-gray-400";
  const iconBg = "bg-zinc-800 text-white hover:bg-zinc-700";

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full bg-black"
      />
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
          className={`max-w-[600px] text-lg sm:text-xl ${subtextColor}`}
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
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${iconBg}`}
          >
            <Github size={20} />
          </a>
          <div className="relative">
            <div
              className={`flex h-10 w-10 cursor-default items-center justify-center rounded-full transition-colors ${iconBg}`}
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
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${iconBg}`}
            aria-label="RSS Feed abonnieren"
          >
            <Rss size={20} />
          </a>
          <Link
            href="/about"
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${iconBg}`}
          >
            <User size={20} />
          </Link>
          <Link
            href="/blog"
            className={`flex h-10 items-center justify-center rounded-full px-4 transition-colors ${iconBg}`}
          >
            Blog
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
