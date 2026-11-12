import { describe, expect, it } from "vitest";

import {
  gitignoreCoversVenv,
  gitignoreCoversWorkDir,
  parseGitignoreLines,
} from "./gitignore.js";

describe("gitignore", () => {
  it("detects venv patterns", () => {
    const lines = parseGitignoreLines("# comment\nvenv/\n");
    expect(gitignoreCoversVenv(lines)).toBe(true);
    expect(gitignoreCoversWorkDir(lines)).toBe(false);
  });

  it("detects workDir patterns", () => {
    const lines = parseGitignoreLines("build/oss-notice/\n");
    expect(gitignoreCoversWorkDir(lines)).toBe(true);
  });
});
