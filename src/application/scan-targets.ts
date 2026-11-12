import { existsSync } from "node:fs";
import { resolve } from "node:path";

import type { AckConfig } from "../domain/ack-config.js";
import { resolveMacAppPath } from "./xcode/resolve-app.js";
import { resolveSpmFromAppPath } from "./xcode/resolve-spm.js";

export type ScanTarget = {
  label: string;
  absolutePath: string;
};

export type ResolveScanResult =
  { ok: true; targets: ScanTarget[] } | { ok: false; message: string };

export type ResolveScanOptions = {
  verbose?: boolean;
};

/**
 * Resolves absolute paths passed to `syft scan dir:…`.
 */
export function resolveScanTargets(
  hostRoot: string,
  config: AckConfig,
  options: ResolveScanOptions = {},
): ResolveScanResult {
  const preset = config.preset;

  if (preset === "macos-app") {
    return resolveMacosAppTargets(hostRoot, config, options);
  }

  const paths = config.scanPaths ?? ["."];
  const targets = paths.map((rel, i) => {
    const absolutePath = resolve(hostRoot, normalizeRel(rel));
    return { label: `scan-${i}`, absolutePath };
  });

  return { ok: true, targets };
}

function resolveMacosAppTargets(
  hostRoot: string,
  config: AckConfig,
  options: ResolveScanOptions,
): ResolveScanResult {
  const merge = config.xcode?.merge ?? ["app", "spm-checkouts"];
  const targets: ScanTarget[] = [];

  let resolvedAppPath: string | undefined;

  if (merge.includes("app")) {
    const app = resolveMacAppPath(hostRoot, config.xcode, { verbose: options.verbose });
    if (!app.ok) {
      return { ok: false, message: app.message };
    }
    resolvedAppPath = app.appPath;
    targets.push({ label: "app", absolutePath: app.appPath });
  }

  if (merge.includes("spm-checkouts")) {
    const spm =
      resolvedAppPath != null
        ? resolveSpmFromAppPath(hostRoot, resolvedAppPath)
        : resolveSpmFromAppPath(hostRoot, "");
    if (spm && existsSync(spm)) {
      targets.push({ label: "spm-checkouts", absolutePath: spm });
    } else {
      console.warn(
        "warn: spm-checkouts path not found (DerivedData/SourcePackages/checkouts, ACK_SPM_CHECKOUTS, or .build/checkouts); skipping",
      );
    }
  }

  if (targets.length === 0) {
    return { ok: false, message: "macos-app: no scan targets resolved" };
  }

  return { ok: true, targets };
}

function normalizeRel(rel: string): string {
  return rel === "./" || rel === "." ? "." : rel;
}
