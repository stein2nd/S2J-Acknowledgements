import { isAbsolute, relative, resolve } from "node:path";

/** True when `outputPath` is a file inside `workDir` (not the workDir path itself). */
export function isOutputInsideWorkDir(outputPath: string, workDir: string): boolean {
  const out = resolve(outputPath);
  const dir = resolve(workDir);
  const rel = relative(dir, out);
  if (!rel || rel === ".") return false;
  return !rel.startsWith("..") && !isAbsolute(rel);
}

export type IntermediatePaths = {
  partialSboms: string[];
  sbomPath: string;
  onotOutputDir: string;
};

/** Paths safe to delete after a successful run (never includes final `outputPath`). */
export function intermediatePathsToRemove(
  paths: IntermediatePaths,
  outputPath: string,
): string[] {
  const out = resolve(outputPath);
  const unique = new Set<string>();
  for (const p of [...paths.partialSboms, paths.sbomPath, paths.onotOutputDir]) {
    if (resolve(p) === out) continue;
    unique.add(resolve(p));
  }
  return [...unique];
}
