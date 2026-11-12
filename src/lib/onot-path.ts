import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

import { which } from "../adapters/exec.js";

export function resolveOnotExecutable(
  hostRoot: string,
  venvPath = "venv",
  onotPath?: string,
): { path: string; source: "venv" | "config" | "path" } | null {
  if (onotPath && existsSync(onotPath)) {
    return { path: onotPath, source: "config" };
  }
  const venvOnot = join(hostRoot, venvPath, "bin", "onot");
  if (existsSync(venvOnot)) {
    return { path: venvOnot, source: "venv" };
  }
  const globalOnot = which("onot");
  if (globalOnot) {
    return { path: globalOnot, source: "path" };
  }
  return null;
}

export function resolveHostRoot(cwdFlag?: string): string {
  return resolve(cwdFlag ?? process.cwd());
}
