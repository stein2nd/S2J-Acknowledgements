import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";

import { mergeSpdxDocuments, packageKey } from "./spdx-merge.js";

describe("spdx-merge", () => {
  it("dedupes packages by name@version", () => {
    const dir = mkdtempSync(join(tmpdir(), "ack-spdx-"));
    const a = join(dir, "a.json");
    const b = join(dir, "b.json");
    const out = join(dir, "merged.json");

    writeFileSync(
      a,
      JSON.stringify({
        spdxVersion: "SPDX-2.3",
        packages: [
          { name: "foo", versionInfo: "1.0.0" },
          { name: "bar", versionInfo: "2.0.0" },
        ],
      }),
    );
    writeFileSync(
      b,
      JSON.stringify({
        spdxVersion: "SPDX-2.3",
        packages: [
          { name: "foo", versionInfo: "1.0.0" },
          { name: "baz", versionInfo: "3.0.0" },
        ],
      }),
    );

    mergeSpdxDocuments([a, b], out);
    const merged = JSON.parse(readFileSync(out, "utf8")) as {
      packages: { name: string; versionInfo: string }[];
    };

    expect(merged.packages).toHaveLength(3);
    expect(packageKey(merged.packages[0])).toBeDefined();
  });

  it("copies single input unchanged", () => {
    const dir = mkdtempSync(join(tmpdir(), "ack-spdx-"));
    const a = join(dir, "a.json");
    const out = join(dir, "out.json");
    const raw = '{"spdxVersion":"SPDX-2.3","packages":[]}';
    writeFileSync(a, raw);
    mergeSpdxDocuments([a], out);
    expect(readFileSync(out, "utf8")).toBe(raw);
  });
});
