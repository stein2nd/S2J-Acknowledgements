import { homedir } from "node:os";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export type SpdxAnonymizeContext = {
  hostRoot: string;
  targets: { label: string; absolutePath: string }[];
};

export type PathReplacement = { from: string; to: string };

/** Longest paths first so nested prefixes are not partially left behind. */
export function buildSpdxPathReplacements(ctx: SpdxAnonymizeContext): PathReplacement[] {
  const replacements: PathReplacement[] = [];
  const seen = new Set<string>();

  const add = (from: string, to: string) => {
    const abs = resolve(from);
    if (abs.length < 2 || seen.has(abs)) return;
    seen.add(abs);
    replacements.push({ from: abs, to });
  };

  for (const t of ctx.targets) {
    add(t.absolutePath, `{SCAN:${t.label}}`);
  }
  add(ctx.hostRoot, "{HOST_ROOT}");

  const home = homedir();
  if (home) {
    add(home, "{HOME}");
  }

  return replacements.sort((a, b) => b.from.length - a.from.length);
}

export function anonymizeString(value: string, replacements: PathReplacement[]): string {
  let out = value;
  for (const { from, to } of replacements) {
    if (out.includes(from)) {
      out = out.split(from).join(to);
    }
  }
  return out;
}

export function anonymizeSpdxValue(value: unknown, replacements: PathReplacement[]): unknown {
  if (typeof value === "string") {
    return anonymizeString(value, replacements);
  }
  if (Array.isArray(value)) {
    return value.map((entry) => anonymizeSpdxValue(entry, replacements));
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      out[key] = anonymizeSpdxValue(entry, replacements);
    }
    return out;
  }
  return value;
}

/** True when Syft used a filesystem path as the SPDX package `name` (not a component id). */
export function isPathLikePackageName(name: string): boolean {
  const n = name.trim();
  if (!n) return false;
  if (n.startsWith("/")) return true;
  if (/^[A-Za-z]:[\\/]/.test(n)) return true;
  if (/^\{(HOME|HOST_ROOT)\}(\/|$)/.test(n)) return true;
  if (/^\{SCAN:[^}]+\}(\/|$)/.test(n)) return true;
  return false;
}

export function prunePathLikePackages(doc: Record<string, unknown>): number {
  const packages = doc.packages;
  if (!Array.isArray(packages)) return 0;
  const before = packages.length;
  doc.packages = packages.filter((pkg) => {
    if (!pkg || typeof pkg !== "object") return true;
    const name = (pkg as { name?: string }).name;
    if (typeof name !== "string") return true;
    return !isPathLikePackageName(name);
  });
  return before - (doc.packages as unknown[]).length;
}

export type PrepareSpdxResult = { droppedPathPackages: number };

/**
 * Anonymize paths, drop path-shaped package rows, then write SPDX for Feluda / onot.
 */
export function prepareSpdxFile(filePath: string, ctx: SpdxAnonymizeContext): PrepareSpdxResult {
  const replacements = buildSpdxPathReplacements(ctx);
  const doc = JSON.parse(readFileSync(filePath, "utf8")) as Record<string, unknown>;
  const anon = anonymizeSpdxValue(doc, replacements) as Record<string, unknown>;

  if (anon.name === "merged-sbom") {
    anon.name = "host-sbom";
  }

  const droppedPathPackages = prunePathLikePackages(anon);
  writeFileSync(filePath, `${JSON.stringify(anon, null, 2)}\n`, "utf8");
  return { droppedPathPackages };
}
