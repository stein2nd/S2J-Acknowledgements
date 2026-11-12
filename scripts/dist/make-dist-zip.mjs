#!/usr/bin/env node
/**
 * Pack npm `files` layout into release/*.zip (CI artifact).
 */
import { createWriteStream } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ZipArchive } from "archiver";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const version = pkg.version ?? "0.0.0";
const outDir = path.join(root, "release");
await mkdir(outDir, { recursive: true });
const outFile = path.join(outDir, `s2j-acknowledgements-${version}.zip`);

const includePaths = (
  pkg.files ?? ["dist/", "presets/", "schema/", "config/", "package.json", "README.md", "LICENSE"]
).map((entry) => entry.replace(/\/$/, ""));

const archive = new ZipArchive({ zlib: { level: 9 } });
const output = createWriteStream(outFile);

const done = new Promise((resolve, reject) => {
  output.on("close", resolve);
  archive.on("error", reject);
});

archive.pipe(output);

for (const rel of includePaths) {
  const abs = path.join(root, rel);
  const stat = await import("node:fs/promises").then((fs) => fs.stat(abs).catch(() => null));
  if (!stat) {
    console.warn(`[dist:zip] skip missing: ${rel}`);
    continue;
  }
  if (stat.isDirectory()) {
    archive.directory(abs, rel);
  } else {
    archive.file(abs, { name: rel });
  }
}

await archive.finalize();
await done;

console.log(`Created ${outFile} (${archive.pointer()} bytes)`);
