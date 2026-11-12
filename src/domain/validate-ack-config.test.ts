import { describe, expect, it } from "vitest";

import type { AckConfig } from "./ack-config.js";
import { validateAckConfig } from "./validate-ack-config.js";
import { resolvePackageRoot } from "../lib/package-root.js";

const packageRoot = resolvePackageRoot();

const valid: AckConfig = {
  preset: "dir",
  output: "ACKNOWLEDGEMENTS.md",
  workDir: "build/oss-notice",
};

describe("validateAckConfig", () => {
  it("accepts merged config", () => {
    expect(validateAckConfig(packageRoot, valid).ok).toBe(true);
  });

  it("rejects missing output", () => {
    const bad = { preset: "dir" } as AckConfig;
    const result = validateAckConfig(packageRoot, bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("output");
    }
  });

  it("rejects invalid preset", () => {
    const bad = { preset: "invalid", output: "x.md" } as AckConfig;
    expect(validateAckConfig(packageRoot, bad).ok).toBe(false);
  });
});
