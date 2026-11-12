import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";

import { findOnotMarkdown } from "./onot-output.js";

describe("findOnotMarkdown", () => {
  it("finds md inside onot output directory", () => {
    const dir = mkdtempSync(join(tmpdir(), "onot-out-"));
    try {
      const md = join(dir, "OSS_Notice_test.md");
      writeFileSync(md, "# Notice");
      expect(findOnotMarkdown(dir)).toBe(md);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("returns file path when given a single md file", () => {
    const dir = mkdtempSync(join(tmpdir(), "onot-out-"));
    const file = join(dir, "notice.md");
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(file, "# x");
      expect(findOnotMarkdown(file)).toBe(file);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
