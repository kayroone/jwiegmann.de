import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";

const read = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const deployYml = read(".github/workflows/deploy.yml");
const workflowFiles = readdirSync(
  new URL("../.github/workflows/", import.meta.url),
).map((name) => `.github/workflows/${name}`);

function jobBlock(text: string, name: string): string {
  const lines = text.split("\n");
  const start = lines.findIndex((line) => line === `  ${name}:`);
  if (start === -1) return "";
  const end = lines.findIndex(
    (line, index) => index > start && /^ {2}\S/.test(line),
  );
  return lines.slice(start, end === -1 ? undefined : end).join("\n");
}

function inOrder(text: string, ...parts: string[]) {
  const positions = parts.map((part) => text.indexOf(part));
  expect(positions.every((position) => position >= 0)).toBe(true);
  expect([...positions].sort((a, b) => a - b)).toEqual(positions);
}

describe("deploy workflow", () => {
  it("runs on pushes and pull requests against main with read-only token", () => {
    expect(deployYml).toMatch(/pull_request:\n\s+branches:\s*\[main\]/);
    expect(deployYml).toMatch(/^permissions:\n\s+contents: read$/m);
  });

  it("checks types and tests before anything else", () => {
    const check = jobBlock(deployYml, "check");

    inOrder(check, "npm ci", "npx tsc --noEmit", "npx vitest run");
    expect(check).toContain("node-version: 22");
    expect(check).toContain("persist-credentials: false");
  });

  it("builds a standalone artifact only after the checks passed", () => {
    const build = jobBlock(deployYml, "build");

    expect(build).toContain("needs: check");
    expect(build).toContain("node-version: 22");
    expect(build).toContain("persist-credentials: false");
    inOrder(
      build,
      "npm run build",
      "cp -r public .next/standalone/public",
      "cp -r .next/static .next/standalone/.next/static",
      "cp ecosystem.config.js .next/standalone/ecosystem.config.js",
      "tar -czf release.tar.gz -C .next/standalone .",
      "upload-artifact",
    );
    expect(build).toContain("retention-days: 1");
  });

  it("deploys only pushes to main, without npm and without repository code", () => {
    const deploy = jobBlock(deployYml, "deploy");

    expect(deploy).toContain("needs: build");
    expect(deploy).toContain(
      "if: github.event_name == 'push' && github.ref == 'refs/heads/main'",
    );
    expect(deploy).toContain("cancel-in-progress: false");
    expect(deploy).toContain("download-artifact");
    expect(deploy).not.toMatch(/npm|checkout|setup-node/);
  });

  it("loads the key itself and verifies the host key", () => {
    const deploy = jobBlock(deployYml, "deploy");

    expect(deploy).toContain('test -n "$DEPLOY_SSH_KEY"');
    expect(deploy).toContain('test -n "$DEPLOY_KNOWN_HOSTS"');
    expect(deploy).toContain("chmod 600");
    expect(deploy).toContain("StrictHostKeyChecking=yes");
  });

  it("uses secrets only in the deploy job", () => {
    const secretLines = deployYml
      .split("\n")
      .filter((line) => line.includes("secrets."));

    expect(secretLines.length).toBeGreaterThan(0);
    for (const line of secretLines) {
      expect(jobBlock(deployYml, "deploy")).toContain(line);
    }
  });
});

describe("all workflows", () => {
  it.each(workflowFiles)("%s pins every action to a commit sha", (path) => {
    const uses = read(path)
      .split("\n")
      .filter(
        (line) =>
          line.trim().startsWith("uses:") || line.trim().startsWith("- uses:"),
      );

    expect(uses.length).toBeGreaterThan(0);
    for (const line of uses) {
      expect(line.trim()).toMatch(/@[0-9a-f]{40}$/);
    }
  });

  it.each(workflowFiles)(
    "%s neither uses webfactory nor skips host key checks",
    (path) => {
      const text = read(path);

      expect(text).not.toContain("webfactory");
      expect(text).not.toContain("StrictHostKeyChecking=no");
    },
  );

  it("lets dependabot update github actions", () => {
    expect(read(".github/dependabot.yml")).toContain(
      'package-ecosystem: "github-actions"',
    );
  });
});
