import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { spawnSync, spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import {
  createSandbox,
  isLinux,
  R,
  type Sandbox,
} from "./helpers/deploy-sandbox";

const RELOAD = (base: string) =>
  `startOrReload ${base}/current/ecosystem.config.js --only jwiegmann --update-env`;

async function waitFor(check: () => boolean) {
  while (!check()) await new Promise((resolve) => setTimeout(resolve, 20));
}

describe.skipIf(!isLinux)(
  "receive-release (Linux only: needs GNU mv -T, flock, GNU tar and /proc)",
  () => {
    let box: Sandbox;

    beforeEach(() => {
      box = createSandbox();
    });

    afterEach(() => {
      box.cleanup();
    });

    describe("input validation", () => {
      it.each([
        ["path traversal", ["../../etc"], {}],
        ["upper case sha", ["20261118T120000Z-ABCDEFG"], {}],
        ["no id at all", [], {}],
        ["shell command as id", [], { SSH_ORIGINAL_COMMAND: "rm -rf /" }],
      ])("rejects %s with exit 2 before touching anything", (_, args, env) => {
        const before = box.snapshot();

        const result = box.run("receive-release", args, {
          stdin: box.makeRelease(),
          env,
        });

        expect(result.status).toBe(2);
        expect(box.snapshot()).toEqual(before);
      });

      it("refuses to overwrite an existing release", () => {
        box.seedRelease(R(1));
        const before = box.snapshot();

        const result = box.run("receive-release", [R(1)], {
          stdin: box.makeRelease(),
        });

        expect(result.status).toBe(3);
        expect(box.snapshot({ ignoreLock: true })).toEqual(before);
      });

      it("reads the id from SSH_ORIGINAL_COMMAND", () => {
        box.seedRelease(R(1));

        const result = box.run("receive-release", [], {
          stdin: box.makeRelease(),
          env: { SSH_ORIGINAL_COMMAND: R(1) },
        });

        expect(result.status).toBe(3);
      });
    });

    describe("unpacking", () => {
      it("unpacks a valid artifact into releases/<id>", () => {
        const result = box.run("receive-release", [R(1)], {
          stdin: box.makeRelease(),
        });

        expect(result.status).toBe(0);
        expect(existsSync(join(box.releases, R(1), "server.js"))).toBe(true);
        expect(box.releaseIds()).toEqual([R(1)]);
      });

      it.each([
        ["a truncated stream", (b: Buffer) => b.subarray(0, 200)],
        ["an empty stream", () => Buffer.alloc(0)],
      ])("rejects %s with exit 4 and leaves nothing behind", (_, mangle) => {
        const result = box.run("receive-release", [R(1)], {
          stdin: mangle(box.makeRelease()),
        });

        expect(result.status).toBe(4);
        expect(box.releaseIds()).toEqual([]);
        expect(box.current()).toBeNull();
      });

      it("rejects an artifact without server.js", () => {
        const result = box.run("receive-release", [R(1)], {
          stdin: box.makeRelease({ "index.js": "" }),
        });

        expect(result.status).toBe(4);
        expect(box.releaseIds()).toEqual([]);
      });

      it("never writes outside the release directory", () => {
        const sub = mkdtempSync(join(box.root, "evil-"));
        mkdirSync(join(sub, "inner"));
        writeFileSync(join(sub, "escape.txt"), "x");
        const evil = join(box.root, "evil.tgz");
        spawnSync("tar", [
          "-czf",
          evil,
          "-P",
          "-C",
          join(sub, "inner"),
          "../escape.txt",
        ]);
        rmSync(join(sub, "escape.txt"));
        const absSource = join(box.root, "abs-src.txt");
        writeFileSync(absSource, "x");
        const abs = join(box.root, "abs.tgz");
        spawnSync("tar", ["-czf", abs, "-P", absSource]);
        rmSync(absSource);

        const traversal = box.run("receive-release", [R(1)], {
          stdin: readFileSync(evil),
        });
        const absolute = box.run("receive-release", [R(2)], {
          stdin: readFileSync(abs),
        });

        expect(traversal.status).toBe(4);
        expect(absolute.status).toBe(4);
        expect(existsSync(join(sub, "escape.txt"))).toBe(false);
        expect(existsSync(join(box.root, "escape.txt"))).toBe(false);
        expect(existsSync(join(box.base, "escape.txt"))).toBe(false);
        expect(existsSync(absSource)).toBe(false);
        expect(box.releaseIds()).toEqual([]);
      });
    });

    describe("first release", () => {
      it("links current without touching PM2", () => {
        const result = box.run("receive-release", [R(1)], {
          stdin: box.makeRelease(),
        });

        expect(result.status).toBe(0);
        expect(box.current()).toBe(join(box.releases, R(1)));
        expect(box.pm2Calls()).toEqual([]);
        expect(box.curlCount()).toBeNull();
      });

      it("refuses to treat a missing current as first release when releases exist", () => {
        box.seedRelease(R(1));

        const result = box.run("receive-release", [R(2)], {
          stdin: box.makeRelease(),
        });

        expect(result.status).toBe(7);
        expect(box.releaseIds()).toEqual([R(1)]);
        expect(box.current()).toBeNull();
        expect(box.pm2Calls()).toEqual([]);
      });

      it("fails without PM2 when current is a real directory", () => {
        mkdirSync(join(box.base, "current"));

        const result = box.run("receive-release", [R(1)], {
          stdin: box.makeRelease(),
        });

        expect(result.status).not.toBe(0);
        expect(box.pm2Calls()).toEqual([]);
      });
    });

    describe("follow-up release", () => {
      beforeEach(() => {
        box.seedRelease(R(1));
        box.linkCurrent(R(1));
        box.startApp(R(1));
      });

      it("switches current, reloads only jwiegmann and passes the health check", () => {
        const result = box.run("receive-release", [R(2)], {
          stdin: box.makeRelease(),
        });

        expect(result.status).toBe(0);
        expect(box.current()).toBe(join(box.releases, R(2)));
        expect(box.pm2Calls()).toEqual([RELOAD(box.base)]);
        expect(box.curlCount()).toBe(1);
      });

      it("finds pm2 although the caller passes a minimal PATH", () => {
        box.run("receive-release", [R(2)], { stdin: box.makeRelease() });

        expect(box.pm2Calls()).toHaveLength(1);
      });

      it("releases the lock although the app keeps running", () => {
        box.run("receive-release", [R(2)], { stdin: box.makeRelease() });

        expect(box.lockIsFree()).toBe(true);
      });

      it("retries the health check until it turns green", () => {
        const result = box.run("receive-release", [R(2)], {
          stdin: box.makeRelease({ "server.js": "", HEALTH: "500,200" }),
        });

        expect(result.status).toBe(0);
        expect(box.curlCount()).toBe(2);
      });

      it("switches back when the health check stays red", () => {
        const result = box.run("receive-release", [R(2)], {
          stdin: box.makeRelease({ "server.js": "", HEALTH: "500" }),
        });

        expect(result.status).toBe(5);
        expect(box.current()).toBe(join(box.releases, R(1)));
        expect(box.pm2Calls()).toHaveLength(2);
        expect(box.curlCount()).toBe(3);
        expect(box.releaseIds()).toEqual([R(1), R(2)]);
      });

      it("turns red when the old process keeps serving", () => {
        const result = box.run("receive-release", [R(2)], {
          stdin: box.makeRelease(),
          env: { FAKE_PM2_MODE: "stale" },
        });

        expect(result.status).toBe(5);
        expect(box.current()).toBe(join(box.releases, R(1)));
      });

      it("turns red when PM2 reports no process", () => {
        writeFileSync(box.pm2Pid, "0");

        const result = box.run("receive-release", [R(2)], {
          stdin: box.makeRelease(),
          env: { FAKE_PM2_MODE: "stale" },
        });

        expect(result.status).toBe(5);
      });

      it("asks PM2 for the pid again on every attempt", () => {
        const first = join(box.root, "first.pid");
        writeFileSync(first, "999999");

        const result = box.run("receive-release", [R(2)], {
          stdin: box.makeRelease(),
          env: { FAKE_PM2_PID_FIRST: first },
        });

        expect(result.status).toBe(0);
        expect(box.curlCount()).toBe(2);
      });
    });

    describe("retention", () => {
      beforeEach(() => {
        for (let n = 1; n <= 7; n++) box.seedRelease(R(n));
        mkdirSync(join(box.releases, ".incoming.abc"));
        writeFileSync(join(box.releases, "notes.txt"), "");
      });

      it("keeps the five newest releases after a green deploy", () => {
        box.linkCurrent(R(7));
        box.startApp(R(7));

        box.run("receive-release", [R(8)], { stdin: box.makeRelease() });

        expect(box.releaseIds()).toEqual([
          ".incoming.abc",
          R(4),
          R(5),
          R(6),
          R(7),
          R(8),
          "notes.txt",
        ]);
      });

      it("never deletes the previous release", () => {
        box.linkCurrent(R(1));
        box.startApp(R(1));

        box.run("receive-release", [R(8)], { stdin: box.makeRelease() });

        expect(box.releaseIds()).toEqual([
          ".incoming.abc",
          R(1),
          R(4),
          R(5),
          R(6),
          R(7),
          R(8),
          "notes.txt",
        ]);
      });

      it("deletes nothing after a red deploy", () => {
        box.linkCurrent(R(7));
        box.startApp(R(7));

        box.run("receive-release", [R(8)], {
          stdin: box.makeRelease({ "server.js": "", HEALTH: "500" }),
        });

        expect(box.releaseIds()).toHaveLength(10);
      });
    });

    describe("locking", () => {
      it("waits for a concurrent deploy to finish", async () => {
        const holder = spawn("flock", [box.lock, "cat"], {
          stdio: ["pipe", "ignore", "ignore"],
        });
        await waitFor(
          () => spawnSync("flock", ["-n", box.lock, "true"]).status === 1,
        );

        const deploy = box.runAsync("receive-release", [R(1)], {
          stdin: box.makeRelease(),
        });
        const exited = new Promise<number | null>((resolve) =>
          deploy.on("exit", resolve),
        );
        await waitFor(
          () =>
            spawnSync("pgrep", ["-P", String(deploy.pid), "-x", "flock"])
              .status === 0,
        );

        expect(deploy.exitCode).toBeNull();
        expect(box.releaseIds()).toEqual([]);
        expect(box.current()).toBeNull();

        holder.stdin!.end();

        expect(await exited).toBe(0);
        expect(box.current()).toBe(join(box.releases, R(1)));
      }, 20_000);
    });
  },
);
