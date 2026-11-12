import { copyFileSync, readFileSync, statSync, writeFileSync } from "node:fs";

export function copyArtifactFile(src: string, dest: string): void {
  const stat = statSync(src);
  if (!stat.isFile()) {
    throw new Error(`expected a file to copy: ${src}`);
  }

  try {
    copyFileSync(src, dest);
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
    if (code !== "ENOTSUP" && code !== "EXDEV") {
      throw err;
    }
    writeFileSync(dest, readFileSync(src));
  }
}
