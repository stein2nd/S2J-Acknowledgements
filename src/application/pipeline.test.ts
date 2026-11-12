import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import type { AckConfig } from "../domain/ack-config.js";
import { planPipeline, runPipeline } from "./pipeline.js";

const hostRoot = resolve(process.cwd());
const baseConfig: AckConfig = {
  preset: "dir",
  output: "build/oss-notice/ACKNOWLEDGEMENTS.test.md",
  workDir: "build/oss-notice",
  scanPaths: ["."],
};

describe("pipeline", () => {
  it("plans dir preset scan", () => {
    const plan = planPipeline(hostRoot, baseConfig);
    expect("error" in plan).toBe(false);
    if ("error" in plan) return;
    expect(plan.targets.length).toBeGreaterThanOrEqual(1);
    expect(plan.targets[0].absolutePath).toBe(hostRoot);
  });

  it("dry-run exits 0", () => {
    const code = runPipeline({
      hostRoot,
      config: baseConfig,
      dryRun: true,
      skipFeluda: true,
      keepIntermediate: false,
      verbose: false,
    });
    expect(code).toBe(0);
  });
});
