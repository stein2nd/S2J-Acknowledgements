import { existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { copyArtifactFile } from "../adapters/copy-artifact.js";
import type { AckConfig } from "../domain/ack-config.js";
import {
  resolveNoticeDocumentName,
  warnIfGenericNoticeDocumentName,
} from "../domain/notice-document-name.js";
import { prepareSpdxFile } from "../domain/spdx-anonymize.js";
import { intermediatePathsToRemove, isOutputInsideWorkDir } from "../domain/workdir-cleanup.js";
import { runFeludaPass } from "./feluda.js";
import { findOnotMarkdown } from "./onot-output.js";
import { runOnotGenerate } from "./onot.js";
import { resolveScanTargets } from "./scan-targets.js";
import { mergeSpdxDocuments } from "./spdx-merge.js";
import { ensureSyftOnPath, runSyftScan } from "./syft.js";

export type PipelineOptions = {
  hostRoot: string;
  config: AckConfig;
  dryRun: boolean;
  skipFeluda: boolean;
  keepIntermediate: boolean;
  verbose: boolean;
};

export type PipelinePlan = {
  targets: { label: string; absolutePath: string }[];
  workDir: string;
  sbomPath: string;
  /** Directory passed to onot `generate -o` (onot writes `OSS_Notice_*.md` inside). */
  onotOutputDir: string;
  outputPath: string;
  syftCommands: string[];
  feluda: boolean;
  onotCommand: string;
};

export function planPipeline(
  hostRoot: string,
  config: AckConfig,
  options?: { verbose?: boolean },
): PipelinePlan | { error: string } {
  const resolved = resolveScanTargets(hostRoot, config, { verbose: options?.verbose });
  if (!resolved.ok) {
    return { error: resolved.message };
  }

  const workDir = resolve(hostRoot, config.workDir ?? "build/oss-notice");
  const sbomPath = join(workDir, "sbom.spdx.json");
  const onotOutputDir = join(workDir, "onot-notice");
  const outputPath = resolve(hostRoot, config.output);

  const venvPath = config.tools?.venvPath ?? "venv";
  const onotConfig = config.pipeline?.onotConfig ?? "onot.yaml";
  const onotExe = join(hostRoot, venvPath, "bin", "onot");

  return {
    targets: resolved.targets,
    workDir,
    sbomPath,
    onotOutputDir,
    outputPath,
    syftCommands: resolved.targets.map((t) => `syft scan dir:${t.absolutePath} -o spdx-json=…`),
    feluda: config.pipeline?.feluda === true,
    onotCommand: `${existsSync(onotExe) ? onotExe : "onot"} generate -i ${sbomPath} -f md -o ${onotOutputDir} --config ${onotConfig}`,
  };
}

export function runPipeline(options: PipelineOptions): number {
  const plan = planPipeline(options.hostRoot, options.config, { verbose: options.verbose });
  if ("error" in plan) {
    console.error(`error: ${plan.error}`);
    return 2;
  }

  const noticeName = resolveNoticeDocumentName(options.config);
  warnIfGenericNoticeDocumentName(noticeName);

  if (options.dryRun) {
    console.log("dry-run: host root", options.hostRoot);
    console.log("dry-run: workDir", plan.workDir);
    console.log("dry-run: targets");
    for (const t of plan.targets) {
      console.log(`  - [${t.label}] ${t.absolutePath}`);
    }
    console.log("dry-run: syft commands (one per target)");
    for (const c of plan.syftCommands) {
      console.log(`  ${c}`);
    }
    console.log("dry-run: merged SBOM →", plan.sbomPath);
    console.log("dry-run: SPDX document name →", noticeName.documentName);
    console.log("dry-run: feluda", options.skipFeluda ? "skipped (--skip-feluda)" : plan.feluda);
    console.log("dry-run: onot →", plan.onotCommand);
    console.log("dry-run: copy onot output dir →", plan.outputPath);
    return 0;
  }

  if (!ensureSyftOnPath()) {
    console.error("error: syft not found on PATH (brew install syft)");
    return 127;
  }

  mkdirSync(plan.workDir, { recursive: true });

  const excludes = options.config.scan?.exclude ?? [];
  const extraArgs = options.config.syft?.extraArgs ?? [];
  const partialSboms: string[] = [];

  for (let i = 0; i < plan.targets.length; i++) {
    const target = plan.targets[i];
    const partial = join(plan.workDir, `sbom.partial-${i}.spdx.json`);
    const result = runSyftScan({
      target,
      outputFile: partial,
      excludes,
      extraArgs,
      verbose: options.verbose,
    });
    if (!result.ok) {
      return result.exitCode === 127 ? 127 : 1;
    }
    partialSboms.push(partial);
  }

  mergeSpdxDocuments(partialSboms, plan.sbomPath);
  const noticeDenylist = options.config.pipeline?.noticeDenylist ?? [];
  const documentName = noticeName.isGeneric ? undefined : noticeName.documentName;
  const spdxPrep = prepareSpdxFile(
    plan.sbomPath,
    {
      hostRoot: options.hostRoot,
      targets: plan.targets,
    },
    { noticeDenylist, documentName },
  );
  if (options.verbose) {
    console.error(
      `verbose: SPDX prepared (${plan.sbomPath}, dropped ${spdxPrep.droppedPathPackages} path-like, ${spdxPrep.droppedNoticePackages} notice-denylist)`,
    );
  } else {
    if (spdxPrep.droppedPathPackages > 0) {
      console.error(
        `info: dropped ${spdxPrep.droppedPathPackages} path-like SPDX package(s) before onot`,
      );
    }
    if (spdxPrep.droppedNoticePackages > 0) {
      console.error(
        `info: dropped ${spdxPrep.droppedNoticePackages} notice-denylist SPDX package(s) before onot`,
      );
    }
  }

  const useFeluda = plan.feluda && !options.skipFeluda;
  if (useFeluda) {
    const feluda = runFeludaPass(plan.sbomPath, {
      verbose: options.verbose,
      feludaArgs: options.config.pipeline?.feludaArgs,
    });
    if (!feluda.ok) {
      return feluda.exitCode;
    }
  }

  const onot = runOnotGenerate({
    hostRoot: options.hostRoot,
    venvPath: options.config.tools?.venvPath ?? "venv",
    onotPath: options.config.tools?.onotPath,
    sbomPath: plan.sbomPath,
    onotConfigRel: options.config.pipeline?.onotConfig,
    outputDir: plan.onotOutputDir,
    verbose: options.verbose,
  });
  if (!onot.ok) {
    return onot.exitCode === 127 ? 127 : 1;
  }

  const noticeFile = findOnotMarkdown(plan.onotOutputDir);
  if (!noticeFile) {
    console.error(`error: onot produced no .md under ${plan.onotOutputDir}`);
    return 1;
  }

  mkdirSync(dirname(plan.outputPath), { recursive: true });
  copyArtifactFile(noticeFile, plan.outputPath);
  console.log(`wrote ${plan.outputPath}`);

  if (!options.keepIntermediate) {
    if (isOutputInsideWorkDir(plan.outputPath, plan.workDir)) {
      for (const path of intermediatePathsToRemove(
        { partialSboms, sbomPath: plan.sbomPath, onotOutputDir: plan.onotOutputDir },
        plan.outputPath,
      )) {
        try {
          const st = statSync(path);
          rmSync(path, st.isDirectory() ? { recursive: true, force: true } : { force: true });
        } catch {
          console.warn(`warn: could not remove ${path}`);
        }
      }
    } else {
      try {
        rmSync(plan.workDir, { recursive: true, force: true });
      } catch {
        console.warn(`warn: could not remove workDir ${plan.workDir}`);
      }
    }
  }

  return 0;
}
