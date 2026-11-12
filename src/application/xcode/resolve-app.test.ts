import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";

import { resolveMacAppPath } from "./resolve-app.js";

describe("resolveMacAppPath", () => {
  it("resolves explicit relative .app under hostRoot", () => {
    const hostRoot = mkdtempSync(join(tmpdir(), "ack-app-"));
    try {
      mkdirSync(join(hostRoot, "Stub.app"));
      const result = resolveMacAppPath(hostRoot, { appPath: "Stub.app" });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.method).toBe("explicit");
        expect(result.appPath).toBe(join(hostRoot, "Stub.app"));
      }
    } finally {
      rmSync(hostRoot, { recursive: true, force: true });
    }
  });

  it("returns structured failure when explicit path missing", () => {
    const hostRoot = mkdtempSync(join(tmpdir(), "ack-app-"));
    try {
      const result = resolveMacAppPath(hostRoot, { appPath: "Missing.app" });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.attempts.length).toBeGreaterThan(0);
        expect(result.message).toContain("Missing.app");
      }
    } finally {
      rmSync(hostRoot, { recursive: true, force: true });
    }
  });
});
