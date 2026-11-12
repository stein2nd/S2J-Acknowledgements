import { readFileSync } from "node:fs";
import { join } from "node:path";

import { mergeHostConfig } from "./config-merge.js";
import { isPresetName } from "./presets.js";

export type PipelineConfig = {
  feluda?: boolean;
  /** Extra feluda argv; `{sbom}` is replaced with the merged SBOM path. */
  feludaArgs?: string[];
  onotFormat?: string;
  onotConfig?: string;
};

export type ScanConfig = {
  exclude?: string[];
};

export type XcodeConfig = {
  project?: string;
  scheme?: string;
  configuration?: string;
  appPath?: string;
  productName?: string;
  merge?: string[];
};

export type ToolsConfig = {
  venvPath?: string;
  onotPath?: string;
};

export type AckConfig = {
  preset?: string;
  output: string;
  workDir?: string;
  scanPaths?: string[];
  scan?: ScanConfig;
  xcode?: XcodeConfig;
  pipeline?: PipelineConfig;
  syft?: { extraArgs?: string[] };
  tools?: ToolsConfig;
};

export type GenerateOverrides = {
  preset?: string;
  out?: string;
  appPath?: string;
};

export function loadMergedAckConfig(
  packageRoot: string,
  configPath: string,
  overrides: GenerateOverrides = {},
): AckConfig {
  const hostRaw = JSON.parse(readFileSync(configPath, "utf8")) as Record<string, unknown>;
  const presetName =
    overrides.preset ??
    (typeof hostRaw.preset === "string" ? hostRaw.preset : undefined);

  if (!presetName || !isPresetName(presetName)) {
    throw new Error(`invalid or missing preset in ${configPath}`);
  }

  const defaults = JSON.parse(
    readFileSync(join(packageRoot, "presets", presetName, "defaults.json"), "utf8"),
  ) as Record<string, unknown>;

  const merged = mergeHostConfig(defaults, {
    ...hostRaw,
    ...(overrides.preset ? { preset: overrides.preset } : {}),
  }) as AckConfig;

  if (overrides.out) {
    merged.output = overrides.out;
  }

  if (!merged.output) {
    throw new Error("config missing required field: output");
  }

  if (overrides.appPath) {
    merged.xcode = { ...merged.xcode, appPath: overrides.appPath };
  }

  if (!merged.workDir) {
    merged.workDir = "build/oss-notice";
  }

  merged.preset = presetName;

  return merged;
}
