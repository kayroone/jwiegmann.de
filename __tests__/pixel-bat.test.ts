import { describe, it, expect, vi } from "vitest";
import {
  BAT_FRAMES,
  BAT_TONE,
  CLOUD_BANDS,
  PixelBat,
  PixelMoon,
  PIXEL_SIZE,
} from "@/app/components/hero-animation";

const midFlight = PixelBat.FIRST_FLIGHT + PixelBat.FLIGHT_DURATION / 2;

function relativeShape(pixels: { x: number; y: number }[]) {
  const minX = Math.min(...pixels.map((pixel) => pixel.x));
  const minY = Math.min(...pixels.map((pixel) => pixel.y));
  return pixels
    .map((pixel) => `${pixel.x - minX}:${pixel.y - minY}`)
    .sort()
    .join("|");
}

describe("PixelBat", () => {
  describe("BAT_FRAMES", () => {
    it("has two frames of equal size", () => {
      expect(BAT_FRAMES).toHaveLength(2);
      expect(BAT_FRAMES[0].length).toBe(BAT_FRAMES[1].length);
      for (let row = 0; row < BAT_FRAMES[0].length; row++) {
        expect(BAT_FRAMES[0][row].length).toBe(BAT_FRAMES[1][row].length);
      }
    });

    it("is symmetric so it reads correctly in both flight directions", () => {
      for (const frame of BAT_FRAMES) {
        for (const row of frame) {
          expect(row).toBe([...row].reverse().join(""));
        }
      }
    });
  });

  describe("getFlightPosition", () => {
    it("is not flying before the first flight", () => {
      const bat = new PixelBat(new PixelMoon(1440, 900));

      expect(bat.getFlightPosition(PixelBat.FIRST_FLIGHT - 0.01)).toBeNull();
    });

    it("is not flying between two flights", () => {
      const bat = new PixelBat(new PixelMoon(1440, 900));
      const betweenFlights =
        PixelBat.FIRST_FLIGHT +
        PixelBat.FLIGHT_DURATION +
        (PixelBat.FLIGHT_INTERVAL - PixelBat.FLIGHT_DURATION) / 2;

      expect(bat.getFlightPosition(betweenFlights)).toBeNull();
    });

    it("crosses the whole moon from left to right on the first flight", () => {
      const moon = new PixelMoon(1440, 900);
      const bat = new PixelBat(moon);
      const start = bat.getFlightPosition(PixelBat.FIRST_FLIGHT + 0.01);
      const end = bat.getFlightPosition(
        PixelBat.FIRST_FLIGHT + PixelBat.FLIGHT_DURATION - 0.01,
      );

      expect(start).not.toBeNull();
      expect(end).not.toBeNull();
      expect(start!.x).toBeLessThan(moon.centerX - moon.bodyRadius);
      expect(end!.x).toBeGreaterThan(moon.centerX + moon.bodyRadius);
    });

    it("flies the second flight from right to left", () => {
      const moon = new PixelMoon(1440, 900);
      const bat = new PixelBat(moon);
      const secondFlight = PixelBat.FIRST_FLIGHT + PixelBat.FLIGHT_INTERVAL;
      const start = bat.getFlightPosition(secondFlight + 0.01);
      const end = bat.getFlightPosition(
        secondFlight + PixelBat.FLIGHT_DURATION - 0.01,
      );

      expect(start!.x).toBeGreaterThan(moon.centerX + moon.bodyRadius);
      expect(end!.x).toBeLessThan(moon.centerX - moon.bodyRadius);
    });

    it("varies the flight height between flights", () => {
      const moon = new PixelMoon(1440, 900);
      const bat = new PixelBat(moon);
      const heights = [0, 1, 2].map(
        (flight) =>
          bat.getFlightPosition(midFlight + flight * PixelBat.FLIGHT_INTERVAL)!
            .y,
      );

      expect(new Set(heights).size).toBe(3);
    });

    it("flies above all cloud bands so it stays visible against the bright moon", () => {
      const moon = new PixelMoon(1440, 900);
      const bat = new PixelBat(moon);
      const highestCloudEdge = Math.min(
        ...CLOUD_BANDS.map((band) => band.offsetY - band.thickness),
      );

      for (let flight = 0; flight < 6; flight++) {
        const position = bat.getFlightPosition(
          midFlight + flight * PixelBat.FLIGHT_INTERVAL,
        )!;
        const offsetY = (position.y - moon.centerY) / moon.bodyRadius;
        expect(offsetY).toBeLessThan(highestCloudEdge);
      }
    });

    it("stays within the moon's height while flying", () => {
      const moon = new PixelMoon(1440, 900);
      const bat = new PixelBat(moon);

      for (let flight = 0; flight < 6; flight++) {
        for (let step = 0; step <= 20; step++) {
          const time =
            PixelBat.FIRST_FLIGHT +
            flight * PixelBat.FLIGHT_INTERVAL +
            (step / 20) * PixelBat.FLIGHT_DURATION * 0.999;
          const position = bat.getFlightPosition(time)!;
          expect(Math.abs(position.y - moon.centerY)).toBeLessThan(
            moon.bodyRadius * 0.9,
          );
        }
      }
    });
  });

  describe("getBatPixels", () => {
    it("is empty while not flying", () => {
      const bat = new PixelBat(new PixelMoon(1440, 900));

      expect(bat.getBatPixels(0)).toEqual([]);
    });

    it("shows the bat in front of the moon at mid-flight", () => {
      const bat = new PixelBat(new PixelMoon(1440, 900));

      expect(bat.getBatPixels(midFlight).length).toBeGreaterThan(10);
    });

    it("only returns pixels in front of the moon disc", () => {
      const moon = new PixelMoon(1440, 900);
      const bat = new PixelBat(moon);
      const moonPositions = new Set(
        moon.getBodyPixels().map((pixel) => `${pixel.x}:${pixel.y}`),
      );

      for (let step = 0; step <= 30; step++) {
        const time =
          PixelBat.FIRST_FLIGHT + (step / 30) * PixelBat.FLIGHT_DURATION;
        for (const pixel of bat.getBatPixels(time)) {
          expect(moonPositions.has(`${pixel.x}:${pixel.y}`)).toBe(true);
        }
      }
    });

    it("aligns all pixels to the PIXEL_SIZE grid", () => {
      const bat = new PixelBat(new PixelMoon(1441, 903));

      for (const pixel of bat.getBatPixels(midFlight)) {
        expect(pixel.x % PIXEL_SIZE).toBe(0);
        expect(pixel.y % PIXEL_SIZE).toBe(0);
      }
    });

    it("flaps its wings", () => {
      const bat = new PixelBat(new PixelMoon(1440, 900));
      const shapes = new Set(
        [0, 1, 2, 3].map((flap) =>
          relativeShape(
            bat.getBatPixels(midFlight + flap * PixelBat.FLAP_DURATION),
          ),
        ),
      );

      expect(shapes.size).toBeGreaterThan(1);
    });
  });

  describe("draw", () => {
    it("paints every bat pixel in the bat tone", () => {
      const bat = new PixelBat(new PixelMoon(1440, 900));
      const fillStyles: string[] = [];
      const context = {
        fillStyle: "",
        fillRect: vi.fn(function (this: { fillStyle: string }) {
          fillStyles.push(this.fillStyle);
        }),
      };

      bat.draw(context as unknown as CanvasRenderingContext2D, midFlight);

      expect(fillStyles).toHaveLength(bat.getBatPixels(midFlight).length);
      for (const fillStyle of fillStyles) {
        expect(fillStyle).toBe(
          `rgb(${BAT_TONE.r}, ${BAT_TONE.g}, ${BAT_TONE.b})`,
        );
      }
    });
  });
});
