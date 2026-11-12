import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";

import { readProjectYmlName } from "./project-yml.js";

describe("project-yml", () => {
  it("reads name from project.yml", () => {
    const dir = mkdtempSync(join(tmpdir(), "ack-yml-"));
    const path = join(dir, "project.yml");
    try {
      writeFileSync(path, "name: CozyBrew\noptions:\n  bundleIdPrefix: dev\n");
      expect(readProjectYmlName(path)).toBe("CozyBrew");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
