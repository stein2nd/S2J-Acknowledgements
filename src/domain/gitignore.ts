/**
 * Line-based gitignore checks per docs/cli.md
 */

const VENV_OK = ["venv/", "venv", "/venv/"];
const WORKDIR_OK = ["build/oss-notice/", "build/oss-notice"];

export function parseGitignoreLines(content: string): string[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}

function lineMatchesAny(line: string, patterns: string[]): boolean {
  return patterns.some((p) => line.includes(p) || line === p.replace(/\/$/, ""));
}

export function gitignoreCoversVenv(lines: string[]): boolean {
  return lines.some((line) => lineMatchesAny(line, VENV_OK));
}

export function gitignoreCoversWorkDir(lines: string[]): boolean {
  return lines.some((line) => lineMatchesAny(line, WORKDIR_OK));
}
