import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { spawnSync, spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  createSandbox,
  isLinux,
  R,
  type Sandbox,
} from "./helpers/deploy-sandbox";

async function waitFor(check: () => boolean) {
  while (!check()) await new Promise((resolve) => setTimeout(resolve, 20));
}

describe.skipIf(!isLinux)(
  "rollback (Linux only: needs GNU mv -T, flock and /proc)",
  () => {
    let box: Sandbox;

    beforeEach(() => {
      box = createSandbox();
    });

    afterEach(() => {
      box.cleanup();
    });

    describe("without argument", () => {
      it("goes back to the previous release and reloads only jwiegmann", () => {
        box.seedRelease(R(1));
        box.seedRelease(R(2));
        box.linkCurrent(R(2));

        const result = box.run("rollback");

        expect(result.status).toBe(0);
        expect(box.current()).toBe(join(box.releases, R(1)));
        expect(box.releaseIds()).toEqual([R(1), R(2)]);
        expect(box.pm2Calls()).toEqual([
          `startOrReload ${box.base}/current/ecosystem.config.js --only jwiegmann --update-env`,
        ]);
      });

      it("steps back one release per call", () => {
        for (let n = 1; n <= 3; n++) box.seedRelease(R(n));
        box.linkCurrent(R(3));

        box.run("rollback");
        box.run("rollback");

        expect(box.current()).toBe(join(box.releases, R(1)));
      });

      it("skips gaps left by retention", () => {
        for (const n of [1, 4, 5]) box.seedRelease(R(n));
        box.linkCurrent(R(5));

        box.run("rollback");

        expect(box.current()).toBe(join(box.releases, R(4)));
      });

      it.each([
        ["only one release", [1], 1],
        ["current is the oldest", [1, 2], 1],
      ])("refuses when %s", (_, ids, currentId) => {
        for (const n of ids) box.seedRelease(R(n));
        box.linkCurrent(R(currentId));

        const result = box.run("rollback");

        expect(result.status).toBe(6);
        expect(box.current()).toBe(join(box.releases, R(currentId)));
        expect(box.pm2Calls()).toEqual([]);
      });

      it("refuses when current is missing", () => {
        box.seedRelease(R(1));

        const result = box.run("rollback");

        expect(result.status).toBe(6);
        expect(box.current()).toBeNull();
      });

      it("releases the lock afterwards", () => {
        box.seedRelease(R(1));
        box.seedRelease(R(2));
        box.linkCurrent(R(2));

        box.run("rollback");

        expect(box.lockIsFree()).toBe(true);
      });
    });

    describe("with a release id", () => {
      beforeEach(() => {
        box.seedRelease(R(1));
        box.seedRelease(R(2));
        box.linkCurrent(R(1));
      });

      it("switches to exactly that release, also forward", () => {
        const result = box.run("rollback", [R(2)]);

        expect(result.status).toBe(0);
        expect(box.current()).toBe(join(box.releases, R(2)));
      });

      it("is idempotent for the current release", () => {
        const result = box.run("rollback", [R(1)]);

        expect(result.status).toBe(0);
        expect(box.pm2Calls()).toHaveLength(1);
      });

      it("refuses a missing release", () => {
        const result = box.run("rollback", [R(9)]);

        expect(result.status).toBe(3);
        expect(box.current()).toBe(join(box.releases, R(1)));
        expect(box.pm2Calls()).toEqual([]);
      });

      it("refuses a release without server.js", () => {
        mkdirSync(join(box.releases, R(3)));

        expect(box.run("rollback", [R(3)]).status).toBe(3);
      });

      it("refuses an invalid id before taking the lock", () => {
        const result = box.run("rollback", ["../../etc"]);

        expect(result.status).toBe(2);
        expect(existsSync(box.lock)).toBe(false);
      });

      it("waits for a running deploy", async () => {
        const holder = spawn("flock", [box.lock, "cat"], {
          stdio: ["pipe", "ignore", "ignore"],
        });
        await waitFor(
          () => spawnSync("flock", ["-n", box.lock, "true"]).status === 1,
        );

        const rollback = box.runAsync("rollback", [R(2)]);
        const exited = new Promise<number | null>((resolve) =>
          rollback.on("exit", resolve),
        );
        await waitFor(
          () =>
            spawnSync("pgrep", ["-P", String(rollback.pid), "-x", "flock"])
              .status === 0,
        );

        expect(rollback.exitCode).toBeNull();
        expect(box.current()).toBe(join(box.releases, R(1)));

        holder.stdin!.end();

        expect(await exited).toBe(0);
        expect(box.current()).toBe(join(box.releases, R(2)));
      }, 20_000);
    });
  },
);
