"use client";

import { useEffect, useRef } from "react";
import { PixelGrass, PIXEL_SIZE } from "@/app/components/hero-animation";

const CANVAS_HEIGHT = 60;

/**
 * Decorative grass for blog pages.
 * Shorter blades with slow wind animation and upward opacity fade.
 */
export default function StaticGrass() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = CANVAS_HEIGHT;

    let grass = new PixelGrass(canvas.width, canvas.height);

    let animationId: number;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = performance.now() * 0.0003;

      for (const blade of grass.blades) {
        const segments = Math.round(blade.height / PIXEL_SIZE);

        for (let s = 0; s < segments; s++) {
          const heightFactor = s / Math.max(segments - 1, 1);
          const g = Math.round(100 + heightFactor * 80);
          const displacement = grass.getBladeDisplacement(
            blade,
            s,
            segments,
            time,
          );

          const px =
            Math.round((blade.x + displacement) / PIXEL_SIZE) * PIXEL_SIZE;
          const py = blade.baseY - (s + 1) * PIXEL_SIZE;

          // Fade out towards top: fully opaque at base, transparent at tip
          const opacity = 1 - heightFactor * 0.7;

          ctx.fillStyle = `rgba(34, ${g}, 34, ${opacity})`;
          ctx.fillRect(px, py, blade.width, PIXEL_SIZE);
        }
      }

      animationId = requestAnimationFrame(draw);
    }

    animationId = requestAnimationFrame(draw);

    const handleResize = () => {
      if (!canvasRef.current) return;
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = CANVAS_HEIGHT;
      grass = new PixelGrass(canvasRef.current.width, canvasRef.current.height);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed bottom-0 left-0 w-full pointer-events-none z-0"
      style={{ height: `${CANVAS_HEIGHT}px` }}
    />
  );
}
