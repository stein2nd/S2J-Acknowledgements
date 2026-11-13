import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  anonymizeSpdxValue,
  anonymizeString,
  buildSpdxPathReplacements,
  isPathLikePackageName,
  matchesNoticeDenylist,
  prepareSpdxFile,
  pruneNoticeDenylistPackages,
  prunePathLikePackages,
  SPDX_GENERIC_DOCUMENT_NAME,
  spdxDocumentNameFromProductName,
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

  it("matches notice denylist globs", () => {
    const patterns = ["actions/*", "codecov/*", "maxim-lobanov/*"];
    expect(matchesNoticeDenylist("actions/checkout", patterns)).toBe(true);
    expect(matchesNoticeDenylist("codecov/codecov-action", patterns)).toBe(true);
    expect(matchesNoticeDenylist("s2j-about-window", patterns)).toBe(false);
  });

  it("strips .app from productName for SPDX document name", () => {
    expect(spdxDocumentNameFromProductName("CozyBrewApp.app")).toBe("CozyBrewApp");
    expect(spdxDocumentNameFromProductName("CozyBrewApp")).toBe("CozyBrewApp");
  });

  it("prepareSpdxFile renames merged-sbom using documentName", () => {
    const hostRoot = mkdtempSync(join(tmpdir(), "spdx-doc-"));
    const path = join(hostRoot, "sbom.spdx.json");
    writeFileSync(path, `${JSON.stringify({ name: "merged-sbom", packages: [] })}\n`);
    prepareSpdxFile(path, { hostRoot, targets: [] }, { documentName: "CozyBrewApp" });
    const doc = JSON.parse(readFileSync(path, "utf8")) as { name: string };
    expect(doc.name).toBe("CozyBrewApp");
  });

  it("prepareSpdxFile keeps host-sbom without documentName", () => {
    const hostRoot = mkdtempSync(join(tmpdir(), "spdx-doc-"));
    const path = join(hostRoot, "sbom.spdx.json");
    writeFileSync(path, `${JSON.stringify({ name: "merged-sbom", packages: [] })}\n`);
    prepareSpdxFile(path, { hostRoot, targets: [] });
    const doc = JSON.parse(readFileSync(path, "utf8")) as { name: string };
    expect(doc.name).toBe(SPDX_GENERIC_DOCUMENT_NAME);
  });

  it("prunes notice-denylist packages from SPDX", () => {
    const doc = {
      packages: [
        { name: "actions/checkout", versionInfo: "v5" },
        { name: "s2j-source-list", versionInfo: "2.0.10" },
      ],
    };
    expect(pruneNoticeDenylistPackages(doc, ["actions/*"])).toBe(1);
    expect((doc.packages as { name: string }[]).map((p) => p.name)).toEqual(["s2j-source-list"]);
  });
});
