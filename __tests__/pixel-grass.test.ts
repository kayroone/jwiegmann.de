import { describe, it, expect } from "vitest";
import {
  PixelGrass,
  PIXEL_SIZE,
  GrassBlade,
} from "@/app/components/hero-animation";

describe("PixelGrass", () => {
  describe("constructor", () => {
    it("generates blades spanning the full canvas width", () => {
      const grass = new PixelGrass(800, 600);
      const blades = grass.blades;

      const minX = Math.min(...blades.map((b) => b.x));
      const maxX = Math.max(...blades.map((b) => b.x));

      expect(minX).toBeLessThanOrEqual(PIXEL_SIZE * 2);
      expect(maxX).toBeGreaterThanOrEqual(800 - PIXEL_SIZE * 5);
    });

    it("all blades are anchored at the bottom of the canvas", () => {
      const grass = new PixelGrass(800, 600);

      for (const blade of grass.blades) {
        expect(blade.baseY).toBe(600);
      }
    });

    it("blade heights are multiples of PIXEL_SIZE between 20 and 80", () => {
      const grass = new PixelGrass(1920, 1080);

      for (const blade of grass.blades) {
        expect(blade.height).toBeGreaterThanOrEqual(20);
        expect(blade.height).toBeLessThanOrEqual(80);
        expect(blade.height % PIXEL_SIZE).toBe(0);
      }
    });

    it("blade widths are either 1x or 2x PIXEL_SIZE", () => {
      const grass = new PixelGrass(1920, 1080);

      const widths = new Set(grass.blades.map((b) => b.width));
      for (const w of widths) {
        expect([PIXEL_SIZE, PIXEL_SIZE * 2]).toContain(w);
      }
      // Should have a mix of both widths
      expect(widths.size).toBe(2);
    });

    it("no gaps wider than 20px between adjacent blades", () => {
      const grass = new PixelGrass(1920, 1080);
      const sorted = [...grass.blades].sort((a, b) => a.x - b.x);

      for (let i = 1; i < sorted.length; i++) {
        const gap = sorted[i].x - sorted[i - 1].x;
        expect(gap).toBeLessThanOrEqual(20);
      }
    });

    it("blade x positions are aligned to PIXEL_SIZE grid", () => {
      const grass = new PixelGrass(800, 600);

      for (const blade of grass.blades) {
        expect(blade.x % PIXEL_SIZE).toBe(0);
      }
    });
  });

  describe("getBladeDisplacement", () => {
    const grass = new PixelGrass(800, 600);
    const blade: GrassBlade = {
      x: 100,
      baseY: 600,
      height: 40,
      width: PIXEL_SIZE,
      phaseOffset: 0,
    };

    it("returns zero displacement at base (segmentIndex 0)", () => {
      const displacement = grass.getBladeDisplacement(blade, 0, 10, 0);
      expect(Math.abs(displacement)).toBe(0);
    });

    it("returns non-zero displacement at tip", () => {
      const displacement = grass.getBladeDisplacement(blade, 9, 10, 0);
      expect(displacement).not.toBe(0);
    });

    it("displacement increases from base to tip (quadratic)", () => {
      const mid = grass.getBladeDisplacement(blade, 5, 10, 0);
      const tip = grass.getBladeDisplacement(blade, 9, 10, 0);
      expect(Math.abs(tip)).toBeGreaterThan(Math.abs(mid));
    });

    it("blades with different phaseOffsets have different displacements", () => {
      const blade2: GrassBlade = { ...blade, phaseOffset: Math.PI };
      const d1 = grass.getBladeDisplacement(blade, 9, 10, 1);
      const d2 = grass.getBladeDisplacement(blade2, 9, 10, 1);
      expect(d1).not.toBe(d2);
    });

    it("has a left-leaning wind bias (average displacement is negative)", () => {
      let sum = 0;
      const samples = 1000;
      for (let t = 0; t < samples; t++) {
        sum += grass.getBladeDisplacement(blade, 9, 10, t * 0.1);
      }
      expect(sum / samples).toBeLessThan(0);
    });
  });

  describe("regenerate", () => {
    it("creates new blades for a different canvas size", () => {
      const grass = new PixelGrass(800, 600);
      const oldCount = grass.blades.length;

      grass.regenerate(1600, 900);

      expect(grass.blades.length).not.toBe(oldCount);
      for (const blade of grass.blades) {
        expect(blade.baseY).toBe(900);
      }
    });
  });
});
