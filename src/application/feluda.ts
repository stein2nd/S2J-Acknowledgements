import { runCommand, which } from "../adapters/exec.js";

export type FeludaOptions = {
  verbose: boolean;
  /** Overrides default `feluda --sbom-input … --sbom-enriched …` (use `{sbom}` placeholder). */
  feludaArgs?: string[];
};

/**
 * Enriches in-place SPDX JSON via Feluda ([docs](https://feluda.readthedocs.io/en/stable/sbom/ingest/)).
 */
export function runFeludaPass(
  sbomPath: string,
  options: FeludaOptions,
): { ok: boolean; exitCode: number } {
  const feluda = which("feluda");
  if (!feluda) {
    console.error("error: pipeline.feluda is enabled but `feluda` was not found on PATH");
    return { ok: false, exitCode: 127 };
  }

  const args =
    options.feludaArgs?.map((a) => a.replaceAll("{sbom}", sbomPath)) ?? defaultFeludaArgs(sbomPath);

  if (options.verbose) {
    console.error(`feluda ${args.join(" ")}`);
  }

  const result = runCommand(feluda, args);
  if (!result.ok) {
    console.error(result.stderr || "feluda failed");
  }

  return { ok: result.ok, exitCode: result.status === 127 ? 127 : (result.status ?? 1) };
}

function defaultFeludaArgs(sbomPath: string): string[] {
  return ["--sbom-input", sbomPath, "--sbom-enriched", sbomPath];
}
