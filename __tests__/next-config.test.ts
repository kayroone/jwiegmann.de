import { describe, it, expect } from "vitest";
import config from "../next.config.mjs";

describe("next.config", () => {
  it("does not ignore type errors during build", () => {
    expect(config.typescript?.ignoreBuildErrors).toBeUndefined();
  });

  it("keeps only the legacy blog redirect", async () => {
    expect(await config.redirects?.()).toEqual([
      { source: "/blog/first-post", destination: "/blog", permanent: true },
    ]);
  });

  it("builds a standalone server", () => {
    expect(config.output).toBe("standalone");
  });
});
