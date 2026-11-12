import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  anonymizeSpdxValue,
  anonymizeString,
  buildSpdxPathReplacements,
  isPathLikePackageName,
  prunePathLikePackages,
} from "./spdx-anonymize.js";

describe("spdx-anonymize", () => {
  it("replaces home, host, and scan roots longest-first", () => {
    const hostRoot = resolve("/Users/alice/proj");
    const appPath = join(hostRoot, "build/Foo.app");
    const replacements = buildSpdxPathReplacements({
      hostRoot,
      targets: [{ label: "app", absolutePath: appPath }],
    });

    const pkgName = `/Users/alice/proj/build/Foo.app/Contents/MacOS/Foo`;
    expect(anonymizeString(pkgName, replacements)).toBe(`{SCAN:app}/Contents/MacOS/Foo`);
    expect(anonymizeString("/Users/alice/proj/README.md", replacements)).toBe(
      "{HOST_ROOT}/README.md",
    );
  });

  it("walks nested SPDX fields", () => {
    const replacements = buildSpdxPathReplacements({
      hostRoot: "/Users/bob/host",
      targets: [],
    });
    const input = {
      packages: [{ name: "/Users/bob/host/vendor/lib", versionInfo: "1" }],
    };
    const out = anonymizeSpdxValue(input, replacements) as typeof input;
    expect(out.packages[0].name).toBe("{HOST_ROOT}/vendor/lib");
  });

  it("detects path-like package names", () => {
    expect(isPathLikePackageName("/Users/a/x.app")).toBe(true);
    expect(isPathLikePackageName("{SCAN:app}")).toBe(true);
    expect(isPathLikePackageName("{SCAN:spm-checkouts}/foo")).toBe(true);
    expect(isPathLikePackageName("s2j-about-window")).toBe(false);
    expect(isPathLikePackageName("actions/checkout")).toBe(false);
  });

  it("prunes path-like packages from SPDX", () => {
    const doc = {
      packages: [
        { name: "{SCAN:app}", versionInfo: "" },
        { name: "docs-linter", versionInfo: "1.0.4" },
        { name: "/still/absolute", versionInfo: "" },
      ],
    };
    expect(prunePathLikePackages(doc)).toBe(2);
    expect((doc.packages as { name: string }[]).map((p) => p.name)).toEqual(["docs-linter"]);
  });
});
