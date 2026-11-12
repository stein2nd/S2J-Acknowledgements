import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { runCommand, which } from "../adapters/exec.js";
import { mergeHostConfig } from "../domain/config-merge.js";
import {
  gitignoreCoversVenv,
  gitignoreCoversWorkDir,
  parseGitignoreLines,
} from "../domain/gitignore.js";
import { isPresetName } from "../domain/presets.js";
import { flagString, parseArgs } from "../lib/args.js";
import { resolveOnotExecutable, resolveHostRoot } from "../lib/onot-path.js";
import { loadRecommendedTools } from "../lib/recommended-tools.js";
import { resolvePackageRoot } from "../lib/package-root.js";

type Row = { name: string; status: "OK" | "WARN" | "MISSING"; detail?: string };

export function runDoctor(argv: string[]): number {
  const { flags } = parseArgs(argv);
  const hostRoot = resolveHostRoot(flagString(flags, "cwd"));
  const configPath = resolveConfigPath(hostRoot, flags);
  const rows: Row[] = [];
  let hasMissing = false;

  const nodeOk = runCommand("node", ["--version"]);
  rows.push({
    name: "Node.js",
    status: nodeOk.ok ? "OK" : "MISSING",
    detail: nodeOk.stdout || nodeOk.stderr,
  });
  if (!nodeOk.ok) hasMissing = true;

  const syftPath = which("syft");
  if (syftPath) {
    const ver = runCommand("syft", ["version"]);
    rows.push({ name: "syft", status: ver.ok ? "OK" : "WARN", detail: ver.stdout.slice(0, 80) });
  } else {
    rows.push({ name: "syft", status: "MISSING", detail: "brew install syft" });
    hasMissing = true;
  }

  let venvPath = "venv";
  let feludaRequired = false;

  if (configPath && existsSync(configPath)) {
    const host = JSON.parse(readFileSync(configPath, "utf8")) as Record<string, unknown>;
    const preset = typeof host.preset === "string" ? host.preset : undefined;
    if (preset && isPresetName(preset)) {
      const packageRoot = resolvePackageRoot();
      const defaults = JSON.parse(
        readFileSync(join(packageRoot, "presets", preset, "defaults.json"), "utf8"),
      ) as Record<string, unknown>;
      const merged = mergeHostConfig(defaults, host);
      const pipeline = merged.pipeline as { feluda?: boolean } | undefined;
      feludaRequired = pipeline?.feluda === true;
      const tools = merged.tools as { venvPath?: string } | undefined;
      venvPath = tools?.venvPath ?? "venv";
    }
  } else if (configPath) {
    rows.push({ name: "ack.config.json", status: "WARN", detail: `not found: ${configPath}` });
  }

  const onot = resolveOnotExecutable(hostRoot, venvPath);
  if (onot) {
    const ver = runCommand(onot.path, ["--version"]);
    rows.push({
      name: "onot",
      status: ver.ok ? "OK" : "WARN",
      detail: `${onot.source}: ${onot.path}`,
    });
  } else {
    rows.push({ name: "onot", status: "MISSING", detail: "run init --preset …" });
    hasMissing = true;
  }

  const py = whichPython();
  rows.push({
    name: "python3 (3.11+)",
    status: py ? "OK" : "WARN",
    detail: py ?? "needed for init",
  });

  const gitignorePath = join(hostRoot, ".gitignore");
  if (existsSync(gitignorePath)) {
    const lines = parseGitignoreLines(readFileSync(gitignorePath, "utf8"));
    const venvOk = gitignoreCoversVenv(lines);
    const workOk = gitignoreCoversWorkDir(lines);
    rows.push({
      name: ".gitignore",
      status: venvOk && workOk ? "OK" : "WARN",
      detail: `venv: ${venvOk ? "yes" : "no"}, build/oss-notice: ${workOk ? "yes" : "no"}`,
    });
  } else {
    rows.push({ name: ".gitignore", status: "WARN", detail: "missing" });
  }

  if (feludaRequired) {
    const feluda = which("feluda");
    rows.push({
      name: "feluda",
      status: feluda ? "OK" : "MISSING",
      detail: feluda ?? "pipeline.feluda is true",
    });
    if (!feluda) hasMissing = true;
  } else {
    rows.push({ name: "feluda", status: "OK", detail: "not required" });
  }

  const recommended = loadRecommendedTools();
  console.log("S2J Acknowledgements — doctor\n");
  for (const row of rows) {
    console.log(`[${row.status}] ${row.name}${row.detail ? ` — ${row.detail}` : ""}`);
  }
  console.log(`\nRecommended pins: syft ${recommended.syft ?? "?"}, onot ${recommended.onot ?? "?"}`);
  console.log("See docs/install.md for setup.");

  return hasMissing ? 1 : 0;
}

function resolveConfigPath(
  hostRoot: string,
  flags: Map<string, string | true>,
): string | undefined {
  const cliConfig = flagString(flags, "config");
  if (cliConfig) return resolve(hostRoot, cliConfig);
  const envConfig = process.env.ACK_CONFIG;
  if (envConfig) return resolve(hostRoot, envConfig);
  const defaultPath = join(hostRoot, "ack.config.json");
  return defaultPath;
}

function whichPython(): string | null {
  const candidates = ["python3", "python"];
  for (const cmd of candidates) {
    const v = runCommand(cmd, ["--version"]);
    if (v.ok && /3\.(1[1-9]|[2-9][0-9])/.test(`${v.stdout} ${v.stderr}`)) {
      return cmd;
    }
  }
  return null;
}
