import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { runPipeline } from "../application/pipeline.js";
import { loadMergedAckConfig } from "../domain/ack-config.js";
import { validateAckConfig } from "../domain/validate-ack-config.js";
import { flagBool, flagString, parseArgs } from "../lib/args.js";
import { resolveHostRoot } from "../lib/onot-path.js";
import { resolvePackageRoot } from "../lib/package-root.js";

export function runGenerate(argv: string[]): number {
  const { flags } = parseArgs(argv);
  const configRel = flagString(flags, "config") ?? process.env.ACK_CONFIG;
  if (!configRel) {
    console.error("error: --config <path> is required (or ACK_CONFIG)");
    return 2;
  }

  const hostRoot = resolveHostRoot(flagString(flags, "cwd"));
  const configPath = resolve(hostRoot, configRel);

  if (!existsSync(configPath)) {
    console.error(`error: config not found: ${configPath}`);
    return 2;
  }

  let config;
  try {
    config = loadMergedAckConfig(resolvePackageRoot(), configPath, {
      preset: flagString(flags, "preset"),
      out: flagString(flags, "out"),
      appPath: flagString(flags, "app") ?? process.env.ACK_APP,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`error: ${message}`);
    return 2;
  }

  const validation = validateAckConfig(resolvePackageRoot(), config);
  if (!validation.ok) {
    console.error(`error: ${validation.message}`);
    return 2;
  }

  return runPipeline({
    hostRoot,
    config,
    dryRun: flagBool(flags, "dry-run"),
    skipFeluda: flagBool(flags, "skip-feluda"),
    keepIntermediate: flagBool(flags, "keep-intermediate"),
    verbose: flagBool(flags, "verbose"),
  });
}
