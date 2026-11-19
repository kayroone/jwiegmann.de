import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { DEPLOY_DIR, isLinux } from "./helpers/deploy-sandbox";

function validId(id: string) {
  return spawnSync(
    "bash",
    ["-c", '. "$0"; valid_id "$1"', join(DEPLOY_DIR, "lib.sh"), id],
    {
      env: {
        NODE_ENV: "test",
        PATH: "/usr/bin:/bin",
        DEPLOY_BASE: "/nonexistent",
      },
    },
  ).status;
}

describe("deploy lib valid_id", () => {
  it.each(["20261120T091502Z-abc1234", "20261101T000000Z-0000001"])(
    "accepts %s",
    (id) => {
      expect(validId(id)).toBe(0);
    },
  );

  it.each([
    "../../etc",
    "20261118T120000Z-ABCDEFG",
    "",
    "20261120T091502Z-abc12345",
    "20261120T091502Z-abc123",
    "20261120T091502Z-abc1234 extra",
    "20261120T091502Z-abc1234\nfoo",
    "2026112T091502Z-abc1234",
    "20261120T091502-abc1234",
  ])("rejects %j", (id) => {
    expect(validId(id)).toBe(1);
  });
});

describe.skipIf(!isLinux)(
  "deploy toolchain (Linux only: the server scripts need GNU mv -T, flock, GNU tar and /proc)",
  () => {
    it("has the GNU tools the scripts rely on", () => {
      expect(spawnSync("flock", ["--version"]).status).toBe(0);
      expect(spawnSync("mv", ["--version"]).stdout.toString()).toContain(
        "GNU coreutils",
      );
      expect(spawnSync("tar", ["--version"]).stdout.toString()).toContain(
        "GNU tar",
      );
      expect(existsSync("/proc/self/cwd")).toBe(true);
    });
  },
);
