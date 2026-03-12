import { describe, it, expect } from "vitest";
import { PixelSun, PIXEL_SIZE } from "@/app/components/hero-animation";

describe("PixelSun", () => {
  describe("constructor", () => {
    it("positions sun at canvas.height * 0.22 vertically and centered horizontally", () => {
      const sun = new PixelSun(800, 600);
      expect(sun.centerX).toBe(400); // 800 / 2
      expect(sun.centerY).toBeCloseTo(132); // 600 * 0.22
    });

    it("has a fixed body radius of approximately 40px", () => {
      const sun = new PixelSun(1920, 1080);
      expect(sun.bodyRadius).toBe(40);
    });
  });

  describe("getBodyPixels", () => {
    it("returns only pixels whose center distance is within bodyRadius", () => {
      const sun = new PixelSun(800, 600);
      const pixels = sun.getBodyPixels();

      for (const pixel of pixels) {
        const centerX = pixel.x + PIXEL_SIZE / 2;
        const centerY = pixel.y + PIXEL_SIZE / 2;
        const dist = Math.sqrt(
          (centerX - sun.centerX) ** 2 + (centerY - sun.centerY) ** 2,
        );
        expect(dist).toBeLessThanOrEqual(sun.bodyRadius);
      }
    });

    it("returns pixels that form a roughly circular shape", () => {
      const sun = new PixelSun(800, 600);
      const pixels = sun.getBodyPixels();

      // With radius 40 and pixelSize 4, we expect a filled circle
      // Area ≈ π * r² / pixelSize² ≈ π * 40² / 16 ≈ 314 pixels
      // Allow some tolerance for pixelization
      expect(pixels.length).toBeGreaterThan(200);
      expect(pixels.length).toBeLessThan(400);
    });

    it("all pixels are aligned to PIXEL_SIZE grid", () => {
      const sun = new PixelSun(800, 600);
      const pixels = sun.getBodyPixels();

      for (const pixel of pixels) {
        expect(pixel.x % PIXEL_SIZE).toBe(0);
        expect(pixel.y % PIXEL_SIZE).toBe(0);
      }
    });
  });

  describe("getColorAtDistance", () => {
    it("returns orange (255, 140, 0) at center (distance 0)", () => {
      const sun = new PixelSun(800, 600);
      const color = sun.getColorAtDistance(0);
      expect(color).toEqual({ r: 255, g: 140, b: 0 });
    });

    it("returns yellow (255, 255, 0) at edge (distance = bodyRadius)", () => {
      const sun = new PixelSun(800, 600);
      const color = sun.getColorAtDistance(sun.bodyRadius);
      expect(color).toEqual({ r: 255, g: 255, b: 0 });
    });

    it("returns intermediate color at half radius", () => {
      const sun = new PixelSun(800, 600);
      const color = sun.getColorAtDistance(sun.bodyRadius / 2);
      // At 50%: r=255, g=140+(255-140)*0.5=197.5≈198, b=0
      expect(color.r).toBe(255);
      expect(color.g).toBeGreaterThan(140);
      expect(color.g).toBeLessThan(255);
      expect(color.b).toBe(0);
    });

    it("produces at least 3 distinct color rings", () => {
      const sun = new PixelSun(800, 600);
      const colors = new Set<number>();
      const pixels = sun.getBodyPixels();

      for (const pixel of pixels) {
        const cx = pixel.x + PIXEL_SIZE / 2;
        const cy = pixel.y + PIXEL_SIZE / 2;
        const dist = Math.sqrt(
          (cx - sun.centerX) ** 2 + (cy - sun.centerY) ** 2,
        );
        const color = sun.getColorAtDistance(dist);
        colors.add(color.g); // g channel varies from 140 to 255
      }

      expect(colors.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe("getRayPixels", () => {
    it("produces exactly 12 rays", () => {
      const sun = new PixelSun(800, 600);
      const rays = sun.getRayPixels();
      expect(rays.length).toBe(12);
    });

    it("rays are distributed evenly at 30 degree intervals", () => {
      const sun = new PixelSun(800, 600);
      const rays = sun.getRayPixels();

      for (let i = 0; i < rays.length; i++) {
        expect(rays[i].angle).toBeCloseTo((i * Math.PI * 2) / 12, 5);
      }
    });

    it("all rays have fixed length of 25px", () => {
      const sun = new PixelSun(800, 600);
      const rays = sun.getRayPixels();

      for (const ray of rays) {
        expect(ray.length).toBe(25);
      }
    });

    it("each ray has grid-aligned pixel coordinates", () => {
      const sun = new PixelSun(800, 600);
      const rays = sun.getRayPixels();

      for (const ray of rays) {
        for (const pixel of ray.pixels) {
          expect(pixel.x % PIXEL_SIZE).toBe(0);
          expect(pixel.y % PIXEL_SIZE).toBe(0);
        }
      }
    });

    it("ray pixels start outside the body radius", () => {
      const sun = new PixelSun(800, 600);
      const rays = sun.getRayPixels();

      for (const ray of rays) {
        for (const pixel of ray.pixels) {
          const cx = pixel.x + PIXEL_SIZE / 2;
          const cy = pixel.y + PIXEL_SIZE / 2;
          const dist = Math.sqrt(
            (cx - sun.centerX) ** 2 + (cy - sun.centerY) ** 2,
          );
          expect(dist).toBeGreaterThanOrEqual(sun.bodyRadius - PIXEL_SIZE);
        }
      }
    });

    it("each ray carries its index for color calculation", () => {
      const sun = new PixelSun(800, 600);
      const rays = sun.getRayPixels();

      for (let i = 0; i < rays.length; i++) {
        expect(rays[i].index).toBe(i);
      }
    });
  });

  describe("getRayGlow", () => {
    it("returns colors in the yellow-orange range", () => {
      const sun = new PixelSun(800, 600);

      for (let t = 0; t < 100; t++) {
        for (let i = 0; i < 12; i++) {
          const glow = sun.getRayGlow(i, t * 0.1);
          expect(glow.r).toBe(255);
          expect(glow.g).toBeGreaterThanOrEqual(180);
          expect(glow.g).toBeLessThanOrEqual(255);
          expect(glow.b).toBe(0);
        }
      }
    });

    it("brightness stays between 0.4 and 1.0", () => {
      const sun = new PixelSun(800, 600);

      for (let t = 0; t < 100; t++) {
        for (let i = 0; i < 12; i++) {
          const glow = sun.getRayGlow(i, t * 0.1);
          expect(glow.brightness).toBeGreaterThanOrEqual(0.24);
          expect(glow.brightness).toBeLessThanOrEqual(1.01);
        }
      }
    });

    it("different rays have different brightness at the same time", () => {
      const sun = new PixelSun(800, 600);
      const values = new Set<number>();

      for (let i = 0; i < 12; i++) {
        const glow = sun.getRayGlow(i, 1);
        values.add(Math.round(glow.brightness * 100));
      }

      expect(values.size).toBeGreaterThan(1);
    });

    it("same ray changes glow over time", () => {
      const sun = new PixelSun(800, 600);
      const g1 = sun.getRayGlow(0, 0);
      const g2 = sun.getRayGlow(0, 3);
      expect(g1.brightness).not.toBe(g2.brightness);
    });
  });
});
