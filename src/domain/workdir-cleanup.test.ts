import { describe, expect, it } from "vitest";

import { intermediatePathsToRemove, isOutputInsideWorkDir } from "./workdir-cleanup.js";

describe("workdir-cleanup", () => {
  it("detects output inside workDir", () => {
    expect(
      isOutputInsideWorkDir(
        "/proj/build/oss-notice/ACKNOWLEDGEMENTS.md",
        "/proj/build/oss-notice",
      ),
    ).toBe(true);
    expect(isOutputInsideWorkDir("/proj/ACKNOWLEDGEMENTS.md", "/proj/build/oss-notice")).toBe(
      false,
    );
  });

  it("does not remove output file from intermediate list", () => {
    const out = "/proj/build/oss-notice/ACKNOWLEDGEMENTS.md";
    const paths = intermediatePathsToRemove(
      {
        partialSboms: ["/proj/build/oss-notice/sbom.partial-0.spdx.json"],
        sbomPath: "/proj/build/oss-notice/sbom.spdx.json",
        onotOutputDir: "/proj/build/oss-notice/onot-notice",
      },
      out,
    );
    expect(paths).not.toContain(out);
    expect(paths.length).toBe(3);
  });
});
