import { describe, it, expect, vi } from "vitest";
import {
  MOON_CRATERS,
  MOON_PALETTE,
  PixelMoon,
  PIXEL_SIZE,
} from "@/app/components/hero-animation";

type MoonPixel = { x: number; y: number; dist: number };

function isInsideAnyCrater(moon: PixelMoon, pixel: MoonPixel): boolean {
  const offsetX = pixel.x + PIXEL_SIZE / 2 - moon.centerX;
  const offsetY = pixel.y + PIXEL_SIZE / 2 - moon.centerY;
  return MOON_CRATERS.some(
    (crater) =>
      Math.hypot(
        offsetX - crater.offsetX * moon.bodyRadius,
        offsetY - crater.offsetY * moon.bodyRadius,
      ) <=
      crater.radius * moon.bodyRadius,
  );
}

function findPixelNearOffset(
  moon: PixelMoon,
  offsetX: number,
  offsetY: number,
): MoonPixel {
  const distanceToOffset = (pixel: MoonPixel) =>
    Math.hypot(
      pixel.x + PIXEL_SIZE / 2 - moon.centerX - offsetX,
      pixel.y + PIXEL_SIZE / 2 - moon.centerY - offsetY,
    );
  return moon
    .getBodyPixels()
    .reduce((nearest, pixel) =>
      distanceToOffset(pixel) < distanceToOffset(nearest) ? pixel : nearest,
    );
}

describe("PixelMoon", () => {
  describe("constructor", () => {
    it("positions moon at canvas.height * 0.18 vertically and centered horizontally", () => {
      const moon = new PixelMoon(800, 600);
      expect(moon.centerX).toBe(400);
      expect(moon.centerY).toBeCloseTo(108);
    });

    it("uses the maximum radius on tall canvases", () => {
      const moon = new PixelMoon(1920, 1080);
      expect(moon.bodyRadius).toBe(PixelMoon.MAX_RADIUS);
    });

    it("shrinks the radius on short canvases", () => {
      const moon = new PixelMoon(800, 600);
      expect(moon.bodyRadius).toBeCloseTo(600 * PixelMoon.RADIUS_TO_HEIGHT);
      expect(moon.bodyRadius).toBeLessThan(PixelMoon.MAX_RADIUS);
    });
  });

  describe("reposition", () => {
    it("moves the center to match the new canvas size", () => {
      const moon = new PixelMoon(800, 600);
      moon.reposition(1200, 1000);
      expect(moon.centerX).toBe(600);
      expect(moon.centerY).toBeCloseTo(180);
    });

    it("fits the radius to the new canvas height", () => {
      const moon = new PixelMoon(1920, 1080);
      moon.reposition(320, 480);
      expect(moon.bodyRadius).toBeCloseTo(480 * PixelMoon.RADIUS_TO_HEIGHT);
    });
  });

  describe("getBodyPixels", () => {
    it("returns only pixels whose center distance is within bodyRadius", () => {
      const moon = new PixelMoon(800, 600);

      for (const pixel of moon.getBodyPixels()) {
        const pixelCenterX = pixel.x + PIXEL_SIZE / 2;
        const pixelCenterY = pixel.y + PIXEL_SIZE / 2;
        const distance = Math.sqrt(
          (pixelCenterX - moon.centerX) ** 2 +
            (pixelCenterY - moon.centerY) ** 2,
        );
        expect(distance).toBeLessThanOrEqual(moon.bodyRadius);
      }
    });

    it("reports the distance to the center for each pixel", () => {
      const moon = new PixelMoon(800, 600);

      for (const pixel of moon.getBodyPixels()) {
        const pixelCenterX = pixel.x + PIXEL_SIZE / 2;
        const pixelCenterY = pixel.y + PIXEL_SIZE / 2;
        const distance = Math.sqrt(
          (pixelCenterX - moon.centerX) ** 2 +
            (pixelCenterY - moon.centerY) ** 2,
        );
        expect(pixel.dist).toBeCloseTo(distance);
      }
    });

    it("returns pixels that form a roughly circular shape", () => {
      const moon = new PixelMoon(800, 600);
      const pixels = moon.getBodyPixels();

      const expectedCount = (Math.PI * moon.bodyRadius ** 2) / PIXEL_SIZE ** 2;

      expect(pixels.length).toBeGreaterThan(expectedCount * 0.9);
      expect(pixels.length).toBeLessThan(expectedCount * 1.1);
    });

    it("aligns all pixels to the PIXEL_SIZE grid", () => {
      const moon = new PixelMoon(801, 603);

      for (const pixel of moon.getBodyPixels()) {
        expect(pixel.x % PIXEL_SIZE).toBe(0);
        expect(pixel.y % PIXEL_SIZE).toBe(0);
      }
    });

    it("returns each grid position only once", () => {
      const moon = new PixelMoon(800, 600);
      const pixels = moon.getBodyPixels();
      const positions = new Set(pixels.map((pixel) => `${pixel.x}:${pixel.y}`));

      expect(positions.size).toBe(pixels.length);
    });

    it("returns the same pixels on repeated calls", () => {
      const moon = new PixelMoon(800, 600);

      expect(moon.getBodyPixels()).toEqual(moon.getBodyPixels());
    });

    it("follows the center after reposition", () => {
      const moon = new PixelMoon(800, 600);
      moon.reposition(1200, 1000);

      for (const pixel of moon.getBodyPixels()) {
        expect(Math.abs(pixel.x - moon.centerX)).toBeLessThanOrEqual(
          moon.bodyRadius + PIXEL_SIZE,
        );
        expect(Math.abs(pixel.y - moon.centerY)).toBeLessThanOrEqual(
          moon.bodyRadius + PIXEL_SIZE,
        );
      }
    });
  });

  describe("MOON_PALETTE", () => {
    it("contains exactly four tones", () => {
      expect(MOON_PALETTE).toHaveLength(4);
    });

    it("is ordered from darkest to lightest", () => {
      const luminances = MOON_PALETTE.map(
        (tone) => 0.2126 * tone.r + 0.7152 * tone.g + 0.0722 * tone.b,
      );

      for (let index = 1; index < luminances.length; index++) {
        expect(luminances[index]).toBeGreaterThan(luminances[index - 1]);
      }
    });

    it("keeps green as the strongest channel in every tone", () => {
      for (const tone of MOON_PALETTE) {
        expect(tone.g).toBeGreaterThanOrEqual(tone.r);
        expect(tone.g).toBeGreaterThanOrEqual(tone.b);
      }
    });
  });

  describe("MOON_CRATERS", () => {
    it("keeps every crater fully inside the moon disc", () => {
      for (const crater of MOON_CRATERS) {
        const distanceFromCenter = Math.hypot(crater.offsetX, crater.offsetY);
        expect(distanceFromCenter + crater.radius).toBeLessThan(1);
      }
    });
  });

  describe("getLightAt", () => {
    it("stays between 0 and 1 for every body pixel", () => {
      const moon = new PixelMoon(800, 600);

      for (const pixel of moon.getBodyPixels()) {
        const light = moon.getLightAt(pixel);
        expect(light).toBeGreaterThanOrEqual(0);
        expect(light).toBeLessThanOrEqual(1);
      }
    });

    it("is brighter at the center than at the limb", () => {
      const moon = new PixelMoon(800, 600);
      const surfacePixels = moon
        .getBodyPixels()
        .filter((pixel) => !isInsideAnyCrater(moon, pixel))
        .sort((first, second) => first.dist - second.dist);
      const centerPixel = surfacePixels[0];
      const limbPixel = surfacePixels[surfacePixels.length - 1];

      expect(moon.getLightAt(centerPixel)).toBeGreaterThan(
        moon.getLightAt(limbPixel),
      );
    });

    it("is lit from the upper right", () => {
      const moon = new PixelMoon(800, 600);
      const halfRadius = moon.bodyRadius / 2;
      const upperRightPixel = findPixelNearOffset(
        moon,
        halfRadius,
        -halfRadius,
      );
      const lowerLeftPixel = findPixelNearOffset(moon, -halfRadius, halfRadius);

      expect(moon.getSurfaceLightAt(upperRightPixel)).toBeGreaterThan(
        moon.getSurfaceLightAt(lowerLeftPixel),
      );
    });

    it("leaves the far side completely unlit", () => {
      const moon = new PixelMoon(800, 600);
      const farSidePixel = findPixelNearOffset(
        moon,
        -moon.bodyRadius * 0.8,
        moon.bodyRadius * 0.4,
      );

      expect(moon.getSurfaceLightAt(farSidePixel)).toBe(0);
    });

    it("is darker inside a lit crater than the bare surface", () => {
      const moon = new PixelMoon(800, 600);

      for (const crater of MOON_CRATERS) {
        const craterPixel = findPixelNearOffset(
          moon,
          crater.offsetX * moon.bodyRadius,
          crater.offsetY * moon.bodyRadius,
        );

        expect(moon.getLightAt(craterPixel)).toBeLessThan(
          moon.getSurfaceLightAt(craterPixel),
        );
      }
    });

    it("matches the bare surface outside of craters", () => {
      const moon = new PixelMoon(800, 600);
      const surfacePixels = moon
        .getBodyPixels()
        .filter((pixel) => !isInsideAnyCrater(moon, pixel));

      for (const pixel of surfacePixels) {
        expect(moon.getLightAt(pixel)).toBe(moon.getSurfaceLightAt(pixel));
      }
    });

    it("looks the same regardless of canvas size", () => {
      const smallCanvasMoon = new PixelMoon(800, 800);
      const largeCanvasMoon = new PixelMoon(1600, 1200);
      const lightsOnSmallCanvas = smallCanvasMoon
        .getBodyPixels()
        .map((pixel) => smallCanvasMoon.getLightAt(pixel));
      const lightsOnLargeCanvas = largeCanvasMoon
        .getBodyPixels()
        .map((pixel) => largeCanvasMoon.getLightAt(pixel));

      expect(lightsOnLargeCanvas).toEqual(lightsOnSmallCanvas);
    });
  });

  describe("getShadeAt", () => {
    it("returns a valid palette index for every body pixel", () => {
      const moon = new PixelMoon(800, 600);

      for (const pixel of moon.getBodyPixels()) {
        const shade = moon.getShadeAt(pixel);
        expect(Number.isInteger(shade)).toBe(true);
        expect(shade).toBeGreaterThanOrEqual(0);
        expect(shade).toBeLessThan(MOON_PALETTE.length);
      }
    });

    it("uses all four tones across the disc", () => {
      const moon = new PixelMoon(800, 600);
      const shades = new Set(
        moon.getBodyPixels().map((pixel) => moon.getShadeAt(pixel)),
      );

      expect(shades.size).toBe(MOON_PALETTE.length);
    });

    it("gives the brightest tone where the light hits head-on", () => {
      const moon = new PixelMoon(800, 600);
      const headOnPixel = findPixelNearOffset(
        moon,
        PixelMoon.LIGHT_DIRECTION.x * moon.bodyRadius,
        PixelMoon.LIGHT_DIRECTION.y * moon.bodyRadius,
      );

      expect(moon.getShadeAt(headOnPixel)).toBe(MOON_PALETTE.length - 1);
    });

    it("paints the unlit side in the darkest tone without dithering", () => {
      const moon = new PixelMoon(800, 600);
      const unlitPixels = moon
        .getBodyPixels()
        .filter((pixel) => moon.getLightAt(pixel) === 0);

      expect(unlitPixels.length).toBeGreaterThan(0);
      for (const pixel of unlitPixels) {
        expect(moon.getShadeAt(pixel)).toBe(0);
      }
    });

    it("dithers only in narrow bands between two tones", () => {
      const moon = new PixelMoon(800, 600);
      const solidPixels = moon.getBodyPixels().filter((pixel) => {
        const position = moon.getLightAt(pixel) * (MOON_PALETTE.length - 1);
        const fraction = position - Math.floor(position);
        return fraction < 0.25 && moon.getLightAt(pixel) < 1;
      });

      for (const pixel of solidPixels) {
        const position = moon.getLightAt(pixel) * (MOON_PALETTE.length - 1);
        expect(moon.getShadeAt(pixel)).toBe(Math.floor(position));
      }
    });

    it("keeps the dither pattern anchored to the moon regardless of canvas size", () => {
      const smallCanvasMoon = new PixelMoon(800, 800);
      const largeCanvasMoon = new PixelMoon(1608, 1200);
      const shadesOnSmallCanvas = smallCanvasMoon
        .getBodyPixels()
        .map((pixel) => smallCanvasMoon.getShadeAt(pixel));
      const shadesOnLargeCanvas = largeCanvasMoon
        .getBodyPixels()
        .map((pixel) => largeCanvasMoon.getShadeAt(pixel));

      expect(shadesOnLargeCanvas).toEqual(shadesOnSmallCanvas);
    });
  });

  describe("draw", () => {
    function createRecordingContext() {
      const fillStyles: string[] = [];
      const context = {
        fillStyle: "",
        fillRect: vi.fn(function (
          this: { fillStyle: string },
          _x: number,
          _y: number,
          _width: number,
          _height: number,
        ) {
          fillStyles.push(this.fillStyle);
        }),
      };
      return { context, fillStyles };
    }

    it("paints one grid cell per body pixel", () => {
      const moon = new PixelMoon(800, 600);
      const { context } = createRecordingContext();

      moon.draw(context as unknown as CanvasRenderingContext2D);

      expect(context.fillRect).toHaveBeenCalledTimes(
        moon.getBodyPixels().length,
      );
      for (const call of context.fillRect.mock.calls) {
        expect(call[2]).toBe(PIXEL_SIZE);
        expect(call[3]).toBe(PIXEL_SIZE);
      }
    });

    it("paints only with colors from the moon palette", () => {
      const moon = new PixelMoon(800, 600);
      const { context, fillStyles } = createRecordingContext();
      const paletteColors = MOON_PALETTE.map(
        (tone) => `rgb(${tone.r}, ${tone.g}, ${tone.b})`,
      );

      moon.draw(context as unknown as CanvasRenderingContext2D);

      for (const fillStyle of fillStyles) {
        expect(paletteColors).toContain(fillStyle);
      }
    });
  });
});
