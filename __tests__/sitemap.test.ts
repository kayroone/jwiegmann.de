import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  it("lists the public pages but leaves out the legal pages", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("https://jwiegmann.de/about");
    expect(
      urls.filter((url) => /\/(impressum|datenschutz)$/.test(url)),
    ).toEqual([]);
  });
});
