import { describe, it, expect, vi } from "vitest";
import {
  CLOUD_BANDS,
  CLOUD_FADE_START,
  CLOUD_TONES,
  PixelClouds,
  PixelMoon,
  PIXEL_SIZE,
} from "@/app/components/hero-animation";

function coverageOfMoon(clouds: PixelClouds, moon: PixelMoon, time: number) {
  const coveredPixels = clouds
    .getCloudPixels(time)
    .filter((pixel) => pixel.isOverMoon).length;
  return coveredPixels / moon.getBodyPixels().length;
}

describe("PixelClouds", () => {
  describe("isInsideBand", () => {
    it("drifts every band to the right over time", () => {
      for (const band of CLOUD_BANDS) {
        for (let offsetX = -2; offsetX <= 2; offsetX += 0.1) {
          const elapsed = 7;
          expect(PixelClouds.isInsideBand(band, offsetX, band.offsetY, 0)).toBe(
            PixelClouds.isInsideBand(
              band,
              offsetX + band.speed * elapsed,
              band.offsetY,
              elapsed,
            ),
          );
        }
      }
    });

    it("leaves gaps along every band", () => {
      for (const band of CLOUD_BANDS) {
        const samples = Array.from({ length: 200 }, (_, index) =>
          PixelClouds.isInsideBand(band, -4 + index * 0.04, band.offsetY, 0),
        );

        expect(samples).toContain(true);
        expect(samples).toContain(false);
      }
    });

    it("tapers every cloud towards its ends instead of cutting it off", () => {
      const heightAt = (
        band: (typeof CLOUD_BANDS)[number],
        offsetX: number,
      ) => {
        let insideSamples = 0;
        for (let step = -100; step <= 100; step++) {
          const offsetY = band.offsetY + (step / 100) * band.thickness;
          if (PixelClouds.isInsideBand(band, offsetX, offsetY, 0)) {
            insideSamples++;
          }
        }
        return (insideSamples / 100) * band.thickness;
      };

      for (const band of CLOUD_BANDS) {
        let previousHeight = heightAt(band, -6);
        for (let offsetX = -6; offsetX <= 6; offsetX += 0.005) {
          const height = heightAt(band, offsetX);
          const isCloudEdge = previousHeight > 0 !== height > 0;
          if (isCloudEdge) {
            expect(Math.max(previousHeight, height)).toBeLessThan(
              band.thickness * 0.3,
            );
          }
          previousHeight = height;
        }
      }
    });

    it("never reaches beyond its thickness from its center line", () => {
      for (const band of CLOUD_BANDS) {
        for (let offsetX = -2; offsetX <= 2; offsetX += 0.05) {
          expect(
            PixelClouds.isInsideBand(
              band,
              offsetX,
              band.offsetY + band.thickness * 1.01,
              3,
            ),
          ).toBe(false);
        }
      }
    });
  });

  describe("getCloudPixels", () => {
    it("aligns all pixels to the PIXEL_SIZE grid", () => {
      const clouds = new PixelClouds(new PixelMoon(1441, 901));

      for (const pixel of clouds.getCloudPixels(12.3)) {
        expect(pixel.x % PIXEL_SIZE).toBe(0);
        expect(pixel.y % PIXEL_SIZE).toBe(0);
      }
    });

    it("returns the same pixels for the same time", () => {
      const clouds = new PixelClouds(new PixelMoon(1440, 900));

      expect(clouds.getCloudPixels(42)).toEqual(clouds.getCloudPixels(42));
    });

    it("changes over time", () => {
      const clouds = new PixelClouds(new PixelMoon(1440, 900));

      expect(clouds.getCloudPixels(10)).not.toEqual(clouds.getCloudPixels(20));
    });

    it("covers part of the moon at some point but never all of it", () => {
      const moon = new PixelMoon(1440, 900);
      const clouds = new PixelClouds(moon);
      const coverages = Array.from({ length: 80 }, (_, index) =>
        coverageOfMoon(clouds, moon, index * 2.5),
      );

      expect(Math.max(...coverages)).toBeGreaterThan(0.1);
      expect(Math.max(...coverages)).toBeLessThan(0.6);
      expect(Math.min(...coverages)).toBeLessThan(0.1);
    });

    it("follows the moon after reposition", () => {
      const moon = new PixelMoon(1440, 900);
      const clouds = new PixelClouds(moon);
      moon.reposition(390, 844);

      for (const pixel of clouds.getCloudPixels(5)) {
        expect(Math.abs(pixel.x - moon.centerX)).toBeLessThanOrEqual(
          moon.bodyRadius * 2 + PIXEL_SIZE,
        );
        expect(Math.abs(pixel.y - moon.centerY)).toBeLessThanOrEqual(
          moon.bodyRadius + PIXEL_SIZE,
        );
      }
    });

    it("fades out towards the left and right end of the area", () => {
      const moon = new PixelMoon(1440, 900);
      const clouds = new PixelClouds(moon);

      for (const time of [3, 17, 44]) {
        for (const pixel of clouds.getCloudPixels(time)) {
          const distanceFromCenter =
            Math.abs(pixel.x + PIXEL_SIZE / 2 - moon.centerX) / moon.bodyRadius;
          if (distanceFromCenter <= CLOUD_FADE_START) {
            expect(pixel.opacity).toBe(1);
          } else {
            expect(pixel.opacity).toBeLessThan(1);
            expect(pixel.opacity).toBeGreaterThanOrEqual(0);
          }
          if (distanceFromCenter >= 1.9) {
            expect(pixel.opacity).toBeLessThanOrEqual(0.15);
          }
        }
      }
    });

    it("keeps clouds in front of the moon fully opaque", () => {
      const clouds = new PixelClouds(new PixelMoon(1440, 900));

      for (const pixel of clouds.getCloudPixels(9)) {
        if (pixel.isOverMoon) {
          expect(pixel.opacity).toBe(1);
        }
      }
    });

    it("marks the upper and lower edge of each cloud as rim", () => {
      const clouds = new PixelClouds(new PixelMoon(1440, 900));
      const pixels = clouds.getCloudPixels(8);
      const positions = new Set(pixels.map((pixel) => `${pixel.x}:${pixel.y}`));

      for (const pixel of pixels) {
        const hasCloudAbove = positions.has(
          `${pixel.x}:${pixel.y - PIXEL_SIZE}`,
        );
        const hasCloudBelow = positions.has(
          `${pixel.x}:${pixel.y + PIXEL_SIZE}`,
        );
        if (!hasCloudAbove || !hasCloudBelow) {
          expect(pixel.isRim).toBe(true);
        }
      }
    });
  });

  describe("draw", () => {
    it("paints over the moon in core and rim tones and elsewhere in the sky tone", () => {
      const clouds = new PixelClouds(new PixelMoon(1440, 900));
      const fillStyles: string[] = [];
      const context = {
        fillStyle: "",
        fillRect: vi.fn(function (this: { fillStyle: string }) {
          fillStyles.push(this.fillStyle);
        }),
      };
      const toColor = (
        tone: { r: number; g: number; b: number },
        opacity: number,
      ) => `rgba(${tone.r}, ${tone.g}, ${tone.b}, ${opacity})`;

      clouds.draw(context as unknown as CanvasRenderingContext2D, 8);

      const pixels = clouds.getCloudPixels(8);
      expect(fillStyles).toHaveLength(pixels.length);
      pixels.forEach((pixel, index) => {
        if (!pixel.isOverMoon) {
          expect(fillStyles[index]).toBe(
            toColor(CLOUD_TONES.sky, pixel.opacity),
          );
        } else if (pixel.isRim) {
          expect(fillStyles[index]).toBe(toColor(CLOUD_TONES.rim, 1));
        } else {
          expect(fillStyles[index]).toBe(toColor(CLOUD_TONES.core, 1));
        }
      });
    });
  });
});
