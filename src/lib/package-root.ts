import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * npm package root (contains package.json, presets/, config/).
 * From bundled `dist/bin/cli.js`: ../../
 */
export function resolvePackageRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [resolve(here, "../.."), resolve(here, ".."), here];
  for (const dir of candidates) {
    if (existsSync(join(dir, "package.json")) && existsSync(join(dir, "presets"))) {
      return dir;
    }
  }
  return resolve(here, "../..");
}
