import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const isLinux = process.platform === "linux";

export const DEPLOY_DIR = fileURLToPath(
  new URL("../../deploy", import.meta.url),
);

export const R = (n: number) =>
  `202611${String(n).padStart(2, "0")}T000000Z-000000${n}`;

const FAKE_PM2 = `#!/bin/bash
echo "$*" >> "$FAKE_PM2_LOG"
case "$1" in
  startOrReload)
    if [ "\${FAKE_PM2_MODE:-restart}" = restart ]; then
      old=$(cat "$FAKE_PM2_PID" 2>/dev/null || echo 0)
      if [ "$old" -gt 0 ] 2>/dev/null; then kill "$old" 2>/dev/null || true; fi
      (cd "$(readlink -f "$DEPLOY_BASE/current")" && exec sleep 300) </dev/null >/dev/null 2>&1 9>&- &
      echo $! > "$FAKE_PM2_PID"
      echo $! >> "$FAKE_PM2_PIDS"
    fi
    ;;
  pid)
    if [ -n "\${FAKE_PM2_PID_FIRST:-}" ] && [ ! -e "$FAKE_PM2_PID_FIRST.used" ]; then
      touch "$FAKE_PM2_PID_FIRST.used"
      cat "$FAKE_PM2_PID_FIRST"
    else
      cat "$FAKE_PM2_PID" 2>/dev/null || echo 0
    fi
    ;;
esac
`;

const FAKE_CURL = `#!/bin/bash
count_file="$FAKE_ROOT/curl.count"
n=$(( $(cat "$count_file" 2>/dev/null || echo 0) + 1 ))
echo "$n" > "$count_file"
health="$(readlink -f "$DEPLOY_BASE/current")/HEALTH"
if [ ! -f "$health" ]; then
  printf 000
  exit 0
fi
IFS=, read -r -a codes < "$health"
i=$(( n - 1 ))
if [ "$i" -ge "\${#codes[@]}" ]; then i=$(( \${#codes[@]} - 1 )); fi
printf '%s' "\${codes[$i]}"
`;

export type RunResult = {
  status: number | null;
  stdout: string;
  stderr: string;
};

export type Sandbox = ReturnType<typeof createSandbox>;

export function createSandbox() {
  const root = mkdtempSync(join(tmpdir(), "deploy-sandbox-"));
  const base = join(root, "base");
  const releases = join(base, "releases");
  const bin = join(root, "bin");
  const pm2Log = join(root, "pm2.log");
  const pm2Pid = join(root, "pm2.pid");
  const pm2Pids = join(root, "pm2.pids");
  const lock = join(base, ".deploy.lock");

  mkdirSync(releases, { recursive: true });
  mkdirSync(bin);
  writeFileSync(join(bin, "pm2"), FAKE_PM2);
  writeFileSync(join(bin, "curl"), FAKE_CURL);
  chmodSync(join(bin, "pm2"), 0o755);
  chmodSync(join(bin, "curl"), 0o755);

  const ownPids: number[] = [];

  function env(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
    return {
      NODE_ENV: "test",
      PATH: "/usr/bin:/bin",
      DEPLOY_BASE: base,
      DEPLOY_NODE_BIN: bin,
      DEPLOY_HEALTH_TRIES: "3",
      DEPLOY_HEALTH_INTERVAL: "0",
      FAKE_ROOT: root,
      FAKE_PM2_LOG: pm2Log,
      FAKE_PM2_PID: pm2Pid,
      FAKE_PM2_PIDS: pm2Pids,
      ...extra,
    };
  }

  function makeRelease(files: Record<string, string> = {}): Buffer {
    const content =
      Object.keys(files).length > 0
        ? files
        : { "server.js": "", "ecosystem.config.js": "", HEALTH: "200" };
    const dir = mkdtempSync(join(root, "artifact-"));
    for (const [name, text] of Object.entries(content)) {
      writeFileSync(join(dir, name), text);
    }
    const tarball = join(root, `${dir.split("/").pop()}.tgz`);
    spawnSync("tar", ["-czf", tarball, "-C", dir, "."]);
    return readFileSync(tarball);
  }

  function seedRelease(id: string, health = "200") {
    const dir = join(releases, id);
    mkdirSync(dir);
    writeFileSync(join(dir, "server.js"), "");
    writeFileSync(join(dir, "ecosystem.config.js"), "");
    writeFileSync(join(dir, "HEALTH"), health);
  }

  function linkCurrent(id: string) {
    symlinkSync(join(releases, id), join(base, "current"));
  }

  function startApp(id: string) {
    const app = spawn("sleep", ["300"], {
      cwd: join(releases, id),
      detached: true,
      stdio: "ignore",
    });
    app.unref();
    ownPids.push(app.pid!);
    writeFileSync(pm2Pid, String(app.pid));
  }

  function run(
    script: string,
    args: string[] = [],
    options: { stdin?: Buffer; env?: Record<string, string> } = {},
  ): RunResult {
    const result = spawnSync("bash", [join(DEPLOY_DIR, script), ...args], {
      input: options.stdin ?? Buffer.alloc(0),
      env: env(options.env),
      timeout: 15_000,
    });
    return {
      status: result.status,
      stdout: result.stdout.toString(),
      stderr: result.stderr.toString(),
    };
  }

  function runAsync(
    script: string,
    args: string[] = [],
    options: { stdin?: Buffer; env?: Record<string, string> } = {},
  ): ChildProcess {
    const child = spawn("bash", [join(DEPLOY_DIR, script), ...args], {
      env: env(options.env),
      stdio: ["pipe", "ignore", "ignore"],
    });
    child.stdin!.end(options.stdin ?? Buffer.alloc(0));
    return child;
  }

  function current(): string | null {
    const link = join(base, "current");
    try {
      return readlinkSync(link);
    } catch {
      return null;
    }
  }

  function releaseIds(): string[] {
    return readdirSync(releases).sort();
  }

  function pm2Calls(): string[] {
    if (!existsSync(pm2Log)) return [];
    return readFileSync(pm2Log, "utf8")
      .split("\n")
      .filter((line) => line.startsWith("startOrReload"));
  }

  function curlCount(): number | null {
    const file = join(root, "curl.count");
    return existsSync(file) ? Number(readFileSync(file, "utf8").trim()) : null;
  }

  function lockIsFree(): boolean {
    return spawnSync("flock", ["-n", lock, "true"]).status === 0;
  }

  function snapshot(options: { ignoreLock?: boolean } = {}): string[] {
    const entries: string[] = [];
    const walk = (dir: string, prefix: string) => {
      for (const name of readdirSync(dir).sort()) {
        if (options.ignoreLock && prefix === "" && name === ".deploy.lock")
          continue;
        const full = join(dir, name);
        const rel = prefix + name;
        const stat = lstatSync(full);
        if (stat.isSymbolicLink()) {
          entries.push(`${rel} -> ${readlinkSync(full)}`);
        } else if (stat.isDirectory()) {
          entries.push(`${rel}/`);
          walk(full, `${rel}/`);
        } else {
          entries.push(
            `${rel} (${stat.mtimeMs}) ${readFileSync(full, "utf8")}`,
          );
        }
      }
    };
    walk(base, "");
    return entries;
  }

  function cleanup() {
    const pids = [...ownPids];
    if (existsSync(pm2Pids)) {
      pids.push(
        ...readFileSync(pm2Pids, "utf8")
          .split("\n")
          .filter(Boolean)
          .map(Number),
      );
    }
    for (const pid of pids) {
      try {
        process.kill(pid, "SIGKILL");
      } catch {}
    }
    rmSync(root, { recursive: true, force: true });
  }

  return {
    root,
    base,
    releases,
    lock,
    pm2Pid,
    env,
    makeRelease,
    seedRelease,
    linkCurrent,
    startApp,
    run,
    runAsync,
    current,
    releaseIds,
    pm2Calls,
    curlCount,
    lockIsFree,
    snapshot,
    cleanup,
  };
}
