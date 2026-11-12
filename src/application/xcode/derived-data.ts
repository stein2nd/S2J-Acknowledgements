import { existsSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export type AppCandidate = {
  path: string;
  mtimeMs: number;
};

export function derivedDataRoot(): string {
  return join(homedir(), "Library/Developer/Xcode/DerivedData");
}

export function derivedDataRootFromAppPath(appPath: string): string | null {
  const parts = appPath.split("/");
  const idx = parts.indexOf("DerivedData");
  if (idx < 0 || idx + 2 >= parts.length) return null;
  return parts.slice(0, idx + 2).join("/");
}

export function findAppsInDerivedData(options: {
  projectToken: string;
  configuration: string;
  productName?: string;
}): { ok: true; apps: AppCandidate[] } | { ok: false; reason: string } {
  const base = derivedDataRoot();
  if (!existsSync(base)) {
    return { ok: false, reason: `DerivedData not found: ${base}` };
  }

  const token = options.projectToken;
  if (!token) {
    return { ok: false, reason: "project token unknown (set xcode.project or project.yml)" };
  }

  const folders = readdirSync(base, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith(`${token}-`))
    .map((e) => join(base, e.name));

  const apps: AppCandidate[] = [];
  const config = options.configuration;

  for (const folder of folders) {
    const productsDir = join(folder, "Build", "Products", config);
    if (!existsSync(productsDir)) continue;
    for (const entry of readdirSync(productsDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || !entry.name.endsWith(".app")) continue;
      const path = join(productsDir, entry.name);
      if (options.productName) {
        const want = options.productName.endsWith(".app")
          ? options.productName
          : `${options.productName}.app`;
        if (entry.name !== want) continue;
      }
      apps.push({ path, mtimeMs: statSync(path).mtimeMs });
    }
  }

  return { ok: true, apps };
}

export function pickSingleApp(
  apps: AppCandidate[],
): { ok: true; path: string } | { ok: false; message: string } {
  if (apps.length === 0) {
    return { ok: false, message: "no .app in DerivedData for configuration" };
  }

  const sorted = [...apps].sort((a, b) => b.mtimeMs - a.mtimeMs);
  const newest = sorted[0].mtimeMs;
  const ties = sorted.filter((a) => a.mtimeMs === newest);

  if (ties.length > 1) {
    return {
      ok: false,
      message: `ambiguous .app (${ties.length} at same mtime); set xcode.productName or --app`,
    };
  }

  return { ok: true, path: sorted[0].path };
}
