import { describe, it, expect } from "vitest";
import { metadata } from "@/app/impressum/page";

describe("Impressum page", () => {
  it("is titled Impressum and kept out of search indexes", () => {
    expect(metadata.title).toBe("Impressum | Jan Wiegmann");
    expect(metadata.robots).toMatchObject({ index: false });
    expect(metadata).not.toHaveProperty("description");
  });
});
