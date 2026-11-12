import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { runCommand } from "../adapters/exec.js";
import { resolveOnotExecutable } from "../lib/onot-path.js";

export function runOnotGenerate(options: {
  hostRoot: string;
  venvPath: string;
  onotPath?: string;
  sbomPath: string;
  onotConfigRel?: string;
  /** onot `generate -o` output directory (not a single file). */
  outputDir: string;
  verbose: boolean;
}): { ok: boolean; exitCode: number; warnedMissingConfig: boolean } {
  const onot = resolveOnotExecutable(options.hostRoot, options.venvPath, options.onotPath);
  if (!onot) {
    console.error("error: onot not found (init --preset … or pipx install onot)");
    return { ok: false, exitCode: 127, warnedMissingConfig: false };
  }

  const args = ["generate", "-i", options.sbomPath, "-f", "md", "-o", options.outputDir];
  let warnedMissingConfig = false;

  if (options.onotConfigRel) {
    const configPath = resolve(options.hostRoot, options.onotConfigRel);
    if (existsSync(configPath)) {
      args.push("--config", configPath);
    } else {
      warnedMissingConfig = true;
      console.warn(`warn: onot config not found (${configPath}); running without --config`);
    }
  }

  if (options.verbose) {
    console.error(`${onot.path} ${args.join(" ")}`);
  }

  const result = runCommand(onot.path, args);
  if (!result.ok) {
    console.error(result.stderr || "onot failed");
  }

  return {
    ok: result.ok,
    exitCode: result.status ?? 1,
    warnedMissingConfig,
  };
}
