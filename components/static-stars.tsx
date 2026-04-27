"use client";

import { useEffect, useRef } from "react";

const CANVAS_HEIGHT = 120;
const STAR_COUNT = 30;

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

function createStars(width: number, height: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() < 0.7 ? 1 : 2,
      baseOpacity: 0.15 + Math.random() * 0.35,
      twinkleSpeed: 0.5 + Math.random() * 1.5,
      twinklePhase: Math.random() * Math.PI * 2,
    });
  }
  return stars;
}

export default function StaticStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = CANVAS_HEIGHT;

    let stars = createStars(canvas.width, canvas.height);
    let animationId: number;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = performance.now() * 0.001;

      for (const star of stars) {
        const twinkle =
          Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.15;
        const opacity = Math.max(0, Math.min(0.7, star.baseOpacity + twinkle));

        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }

      animationId = requestAnimationFrame(draw);
    }

    animationId = requestAnimationFrame(draw);

    const handleResize = () => {
      if (!canvasRef.current) return;
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = CANVAS_HEIGHT;
      stars = createStars(canvasRef.current.width, canvasRef.current.height);
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
