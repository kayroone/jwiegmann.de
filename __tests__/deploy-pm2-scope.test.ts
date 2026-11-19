import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { DEPLOY_DIR } from "./helpers/deploy-sandbox";

const PROCESS_COMMANDS = ["startOrReload", "start", "reload", "restart"];
const LOOKUP_COMMANDS = ["pid", "describe"];

function pm2Calls(text: string): string[] {
  return text
    .replace(/\\\n\s*/g, " ")
    .split("\n")
    .flatMap((line) =>
      [...line.matchAll(/(?:^|[^\w$-])pm2\s+[^;&|)]*/g)].map((m) =>
        m[0].trim(),
      ),
    );
}

function violations(text: string): string[] {
  const found: string[] = [];
  for (const call of pm2Calls(text)) {
    const words = call.replace(/^[^p]*pm2/, "pm2").split(/\s+/);
    const command = words[1];
    const args = words.slice(2);
    if (args.includes("all")) {
      found.push(call);
    } else if (PROCESS_COMMANDS.includes(command)) {
      const only = args.indexOf("--only");
      if (only === -1 || args[only + 1] !== "jwiegmann") found.push(call);
    } else if (LOOKUP_COMMANDS.includes(command)) {
      if (args[0] !== "jwiegmann") found.push(call);
    } else {
      found.push(call);
    }
  }
  return found;
}

describe("pm2 scope check", () => {
  it.each([
    "pm2 reload all",
    "pm2 delete jwiegmann",
    "pm2 stop jwiegmann",
    "pm2 kill",
    "pm2 save",
    "pm2 startOrReload eco.js --update-env",
    "pm2 restart cca-prep-api",
    "pm2 pid",
    "pm2 describe other",
    "pm2 flush",
  ])("flags %j", (line) => {
    expect(violations(line)).toHaveLength(1);
  });

  it.each([
    'pm2 startOrReload "$DEPLOY_BASE/current/ecosystem.config.js" --only jwiegmann --update-env',
    "pid=$(pm2 pid jwiegmann 2>/dev/null || true)",
    'echo "$FAKE_PM2_LOG"',
  ])("accepts %j", (line) => {
    expect(violations(line)).toEqual([]);
  });

  it("deploy scripts only address jwiegmann", () => {
    const files = readdirSync(DEPLOY_DIR);
    const texts = files.map((name) =>
      readFileSync(join(DEPLOY_DIR, name), "utf8"),
    );

    expect(texts.flatMap(pm2Calls).length).toBeGreaterThan(0);
    expect(texts.flatMap(violations)).toEqual([]);
    expect(texts.join("\n")).not.toContain("cca-prep");
  });
});
