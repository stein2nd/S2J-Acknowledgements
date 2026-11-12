import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * onot `generate -o <dir>` writes `OSS_Notice_*.md` inside the directory.
 */
export function findOnotMarkdown(onotOutputPath: string): string | null {
  if (!existsSync(onotOutputPath)) return null;

  const stat = statSync(onotOutputPath);
  if (stat.isFile() && onotOutputPath.endsWith(".md")) {
    return onotOutputPath;
  }
  if (!stat.isDirectory()) return null;

  const mdFiles = readdirSync(onotOutputPath, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => join(onotOutputPath, e.name));

  if (mdFiles.length === 0) return null;
  if (mdFiles.length === 1) return mdFiles[0];

  return [...mdFiles].sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
}
