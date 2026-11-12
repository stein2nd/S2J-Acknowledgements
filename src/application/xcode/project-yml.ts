import { existsSync, readFileSync } from "node:fs";

/**
 * Best-effort `name:` read from XcodeGen project.yml (no YAML parser).
 */
export function readProjectYmlName(projectYmlPath: string): string | null {
  if (!existsSync(projectYmlPath)) return null;
  const text = readFileSync(projectYmlPath, "utf8");
  const match = text.match(/^name:\s*['"]?([^'"\n#]+)['"]?\s*$/m);
  return match?.[1]?.trim() ?? null;
}
