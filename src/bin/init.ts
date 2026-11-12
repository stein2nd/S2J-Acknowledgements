import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { runCommand } from "../adapters/exec.js";
import {
  gitignoreCoversVenv,
  gitignoreCoversWorkDir,
  parseGitignoreLines,
} from "../domain/gitignore.js";
import { isPresetName } from "../domain/presets.js";
import { flagBool, flagString, parseArgs } from "../lib/args.js";
import { loadRecommendedTools } from "../lib/recommended-tools.js";
import { resolvePackageRoot } from "../lib/package-root.js";

const GITIGNORE_TEMPLATE = `venv/
build/oss-notice/
`;

function resolveHostRoot(flags: Map<string, string | true>): string {
  const cwd = flagString(flags, "cwd");
  return resolve(cwd ?? process.cwd());
}

export function runInit(argv: string[]): number {
  const { flags } = parseArgs(argv);
  const preset = flagString(flags, "preset");
  if (!preset) {
    console.error("error: --preset is required (macos-app | wordpress | dir)");
    return 2;
  }
  if (!isPresetName(preset)) {
    console.error(`error: unknown preset "${preset}"`);
    return 2;
  }

  const hostRoot = resolveHostRoot(flags);
  const force = flagBool(flags, "force");
  const writeGitignore = flagBool(flags, "write-gitignore");
  const packageRoot = resolvePackageRoot();
  const defaultsPath = join(packageRoot, "presets", preset, "defaults.json");
  const ackPath = join(hostRoot, "ack.config.json");

  if (existsSync(ackPath) && !force) {
    console.warn("warn: ack.config.json already exists; skipping (use --force to overwrite)");
  } else {
    const defaults = readFileSync(defaultsPath, "utf8");
    writeFileSync(ackPath, `${JSON.stringify(JSON.parse(defaults), null, 2)}\n`, "utf8");
    console.log(`wrote ${ackPath}`);
  }

  const onotExampleCandidates = [
    join(packageRoot, "presets", preset, "onot.yaml.example"),
    join(packageRoot, "presets", "shared", "onot.yaml.example"),
  ];
  const onotDest = join(hostRoot, "onot.yaml");
  if (!existsSync(onotDest)) {
    const src = onotExampleCandidates.find((p) => existsSync(p));
    if (src) {
      copyFileSync(src, onotDest);
      console.log(`wrote ${onotDest}`);
    }
  }

  const venvDir = join(hostRoot, "venv");
  if (!existsSync(venvDir)) {
    const py = whichPython();
    if (!py) {
      console.error("error: python3 3.11+ not found on PATH");
      return 2;
    }
    mkdirSync(hostRoot, { recursive: true });
    const venvResult = runCommand(py, ["-m", "venv", venvDir], { cwd: hostRoot });
    if (!venvResult.ok) {
      console.error(venvResult.stderr || "venv creation failed");
      return 1;
    }
    const tools = loadRecommendedTools();
    const onotSpec = `onot[spdx,cyclonedx]==${tools.onot ?? "1.2.0"}`;
    const pip = join(venvDir, "bin", "pip");
    const extras = tools.onotExtras ?? ["openpyxl"];
    const pipArgs = ["install", onotSpec, ...extras];
    const pipResult = runCommand(pip, pipArgs, { cwd: hostRoot });
    if (!pipResult.ok) {
      console.error(pipResult.stderr || "pip install failed");
      return 1;
    }
    console.log(`created ${venvDir}`);
  } else {
    console.warn("warn: venv/ already exists; not modifying");
  }

  const gitignorePath = join(hostRoot, ".gitignore");
  if (!existsSync(gitignorePath)) {
    console.log("\nAdd to .gitignore:\n");
    console.log(GITIGNORE_TEMPLATE);
    if (writeGitignore) {
      writeFileSync(gitignorePath, GITIGNORE_TEMPLATE, "utf8");
      console.log(`wrote ${gitignorePath}`);
    }
  } else {
    const lines = parseGitignoreLines(readFileSync(gitignorePath, "utf8"));
    if (!gitignoreCoversVenv(lines) || !gitignoreCoversWorkDir(lines)) {
      console.warn("warn: .gitignore missing venv/ and/or build/oss-notice/ — add manually:");
      console.warn(GITIGNORE_TEMPLATE);
    }
  }

  return 0;
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
