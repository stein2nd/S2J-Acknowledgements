import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

import { readProjectYmlName } from "./project-yml.js";

export function findXcodeProject(hostRoot: string, projectFile?: string): string | null {
  if (projectFile) {
    const path = resolve(hostRoot, projectFile);
    return existsSync(path) ? path : null;
  }

  const entries = readdirSync(hostRoot, { withFileTypes: true });
  const projects = entries
    .filter((e) => e.isDirectory() && e.name.endsWith(".xcodeproj"))
    .map((e) => join(hostRoot, e.name));

  if (projects.length === 1) return projects[0];
  if (projects.length > 1) return null;
  return null;
}

/** Basename token for DerivedData folder prefix (e.g. `CozyBrew`). */
export function derivedDataProjectToken(hostRoot: string, xcodeProject?: string): string {
  if (xcodeProject) {
    const base = xcodeProject.split(/[/\\]/).pop() ?? xcodeProject;
    return base.replace(/\.xcodeproj$/i, "");
  }
  const ymlName = readProjectYmlName(join(hostRoot, "project.yml"));
  if (ymlName) return ymlName;
  return "";
}
