import { readFileSync } from "node:fs";
import { join } from "node:path";

import { resolvePackageRoot } from "./package-root.js";

export type RecommendedTools = {
  syft?: string;
  onot?: string;
  onotExtras?: string[];
  feluda?: string | null;
  python?: string;
};

export function loadRecommendedTools(): RecommendedTools {
  const root = resolvePackageRoot();
  const raw = readFileSync(join(root, "config", "recommended-tools.json"), "utf8");
  return JSON.parse(raw) as RecommendedTools;
}
