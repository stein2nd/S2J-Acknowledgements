import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

import { derivedDataRootFromAppPath } from "./derived-data.js";

/**
 * Resolves SPM SourcePackages/checkouts for SPDX merge scan.
 */
export function resolveSpmCheckoutsPath(
  hostRoot: string,
  derivedDataFolder?: string,
): string | null {
  if (derivedDataFolder) {
    const inDerived = join(derivedDataFolder, "SourcePackages", "checkouts");
    if (existsSync(inDerived)) return inDerived;
  }

  if (process.env.ACK_SPM_CHECKOUTS) {
    const envPath = resolve(process.env.ACK_SPM_CHECKOUTS);
    if (existsSync(envPath)) return envPath;
  }

  const local = resolve(hostRoot, ".build/checkouts");
  if (existsSync(local)) return local;

  return null;
}

export function resolveSpmFromAppPath(hostRoot: string, appPath: string): string | null {
  const folder = derivedDataRootFromAppPath(appPath);
  return resolveSpmCheckoutsPath(hostRoot, folder ?? undefined);
}
