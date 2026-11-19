import { describe, it, expect } from "vitest";
import { metadata } from "@/app/datenschutz/page";

describe("Datenschutz page", () => {
  it("is titled Datenschutz and kept out of search indexes", () => {
    expect(metadata.title).toBe("Datenschutz | Jan Wiegmann");
    expect(metadata.robots).toMatchObject({ index: false });
    expect(metadata).not.toHaveProperty("description");
  });
});
