import { describe, it, expect } from "vitest";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);

describe("ecosystem.config", () => {
  it("runs only jwiegmann from the current release, bound to localhost", () => {
    const { apps } = require("../ecosystem.config.js");

    expect(apps).toEqual([
      {
        name: "jwiegmann",
        script: "server.js",
        cwd: "/home/kayro/apps/jwiegmann.de/current",
        interpreter: "/home/kayro/.nvm/versions/node/v22.19.0/bin/node",
        env: { PORT: 3000, HOSTNAME: "127.0.0.1" },
      },
    ]);
  });

  it("does not resolve the release path at load time", () => {
    const source = readFileSync(
      new URL("../ecosystem.config.js", import.meta.url),
      "utf8",
    );

    expect(source).not.toContain("__dirname");
    expect(source).not.toContain("exec_mode");
  });
});
