import { existsSync } from "node:fs";
import { basename, resolve } from "node:path";

import { runCommand, which } from "../../adapters/exec.js";
import type { XcodeConfig } from "../../domain/ack-config.js";
import { derivedDataProjectToken, findXcodeProject } from "./project-discovery.js";
import { findAppsInDerivedData, pickSingleApp } from "./derived-data.js";
import { appPathFromBuildSettings, parseBuildSettings } from "./parse-build-settings.js";

export type AppResolveResult =
  | { ok: true; appPath: string; method: string; derivedDataFolder?: string }
  | { ok: false; message: string; attempts: string[] };

export function resolveMacAppPath(
  hostRoot: string,
  xcode: XcodeConfig | undefined,
  options: { verbose?: boolean } = {},
): AppResolveResult {
  const attempts: string[] = [];
  const cfg = xcode ?? {};

  const explicit = cfg.appPath ?? process.env.ACK_APP;
  if (explicit) {
    attempts.push("explicit: xcode.appPath / ACK_APP / --app");
    const absolutePath = resolve(hostRoot, explicit);
    if (!existsSync(absolutePath)) {
      return {
        ok: false,
        message: `.app not found: ${absolutePath}`,
        attempts,
      };
    }
    return {
      ok: true,
      appPath: absolutePath,
      method: "explicit",
      derivedDataFolder: derivedDataFolderFromPath(absolutePath),
    };
  }

  const xcodebuild = which("xcodebuild");
  const projectPath = findXcodeProject(hostRoot, cfg.project);
  const scheme = cfg.scheme;
  const configuration = cfg.configuration ?? "Release";

  if (xcodebuild && projectPath && scheme) {
    attempts.push(`xcodebuild -showBuildSettings (${projectPath}, ${scheme})`);
    const args = [
      "-project",
      projectPath,
      "-scheme",
      scheme,
      "-configuration",
      configuration,
      "-showBuildSettings",
    ];
    if (options.verbose) {
      console.error(`xcodebuild ${args.join(" ")}`);
    }
    const result = runCommand(xcodebuild, args, { cwd: hostRoot });
    if (result.ok) {
      const settings = parseBuildSettings(result.stdout);
      const built = appPathFromBuildSettings(settings, cfg.productName);
      if (built && existsSync(built)) {
        return {
          ok: true,
          appPath: built,
          method: "xcodebuild",
          derivedDataFolder: derivedDataFolderFromPath(built),
        };
      }
      attempts.push("xcodebuild: BUILT_PRODUCTS_DIR path missing or not on disk");
    } else {
      attempts.push(`xcodebuild failed: ${result.stderr.slice(0, 120)}`);
    }
  } else {
    if (!xcodebuild) attempts.push("xcodebuild: not on PATH");
    if (!projectPath) attempts.push("xcode.project / *.xcodeproj: not found");
    if (!scheme) attempts.push("xcode.scheme: required for xcodebuild");
  }

  const projectFile = cfg.project ?? (projectPath ? basename(projectPath) : undefined);
  const token = derivedDataProjectToken(hostRoot, projectFile);
  attempts.push(`DerivedData glob (token=${token || "?"}, ${configuration})`);
  const glob = findAppsInDerivedData({
    projectToken: token,
    configuration,
    productName: cfg.productName,
  });

  if (glob.ok) {
    const picked = pickSingleApp(glob.apps);
    if (picked.ok) {
      return {
        ok: true,
        appPath: picked.path,
        method: "derived-data",
        derivedDataFolder: derivedDataFolderFromPath(picked.path),
      };
    }
    attempts.push(picked.message);
  } else {
    attempts.push(glob.reason);
  }

  return {
    ok: false,
    message: formatResolveFailure(attempts),
    attempts,
  };
}

function derivedDataFolderFromPath(appPath: string): string | undefined {
  const parts = appPath.split("/");
  const idx = parts.indexOf("DerivedData");
  if (idx < 0 || idx + 2 >= parts.length) return undefined;
  return parts.slice(0, idx + 2).join("/");
}

function formatResolveFailure(attempts: string[]): string {
  const lines = [
    "macos-app: could not resolve Release .app",
    "Tried:",
    ...attempts.map((a) => `  - ${a}`),
    "Hint: Release build, then --app / ACK_APP / xcode.appPath, or set xcode.scheme for xcodebuild",
    "Note: missing .app is separate from `doctor` tool checks",
  ];
  return lines.join("\n");
}
