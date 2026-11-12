import { runCommand, which } from "../adapters/exec.js";
import type { ScanTarget } from "./scan-targets.js";

export function ensureSyftOnPath(): string | null {
  return which("syft");
}

export function runSyftScan(options: {
  target: ScanTarget;
  outputFile: string;
  excludes: string[];
  extraArgs: string[];
  verbose: boolean;
}): { ok: boolean; exitCode: number; command: string } {
  const syft = which("syft");
  if (!syft) {
    return { ok: false, exitCode: 127, command: "syft" };
  }

  const args = [
    "scan",
    `dir:${options.target.absolutePath}`,
    "-o",
    `spdx-json=${options.outputFile}`,
    "-q",
  ];

  for (const pattern of options.excludes) {
    args.push("--exclude", pattern);
  }

  args.push(...options.extraArgs);

  const command = `syft ${args.join(" ")}`;
  if (options.verbose) {
    console.error(command);
  }

  const result = runCommand(syft, args);
  if (!result.ok) {
    console.error(result.stderr || `syft failed for ${options.target.label}`);
  }

  return {
    ok: result.ok,
    exitCode: result.status ?? 1,
    command,
  };
}
