import { describe, it, expect } from "vitest";
import { PIXEL_SIZE } from "@/app/components/hero-animation";

describe("PIXEL_SIZE", () => {
  it("is 4 pixels", () => {
    expect(PIXEL_SIZE).toBe(4);
  });

  it("is a positive integer", () => {
    expect(Number.isInteger(PIXEL_SIZE)).toBe(true);
    expect(PIXEL_SIZE).toBeGreaterThan(0);
  });
});
