import { readFileSync, writeFileSync } from "node:fs";

type SpdxDocument = {
  spdxVersion?: string;
  packages?: SpdxPackage[];
  [key: string]: unknown;
};

type SpdxPackage = {
  name?: string;
  versionInfo?: string;
  [key: string]: unknown;
};

export function packageKey(pkg: SpdxPackage): string {
  const name = pkg.name ?? "unknown";
  const version = pkg.versionInfo ?? "";
  return `${name}@${version}`;
}

/**
 * Merges Syft SPDX JSON documents into one file (packages deduped by name@version).
 */
export function mergeSpdxDocuments(inputPaths: string[], outputPath: string): void {
  if (inputPaths.length === 0) {
    throw new Error("mergeSpdxDocuments: no inputs");
  }

  if (inputPaths.length === 1) {
    const single = readFileSync(inputPaths[0], "utf8");
    writeFileSync(outputPath, single);
    return;
  }

  const base = JSON.parse(readFileSync(inputPaths[0], "utf8")) as SpdxDocument;
  const packageMap = new Map<string, SpdxPackage>();

  for (const path of inputPaths) {
    const doc = JSON.parse(readFileSync(path, "utf8")) as SpdxDocument;
    for (const pkg of doc.packages ?? []) {
      packageMap.set(packageKey(pkg), pkg);
    }
  }

  const merged: SpdxDocument = {
    ...base,
    name: "merged-sbom",
    packages: [...packageMap.values()],
  };

  writeFileSync(outputPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
}
