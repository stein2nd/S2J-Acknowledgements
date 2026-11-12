import { spawnSync } from "node:child_process";

export type ExecResult = {
  ok: boolean;
  status: number | null;
  stdout: string;
  stderr: string;
};

export function runCommand(
  command: string,
  args: string[],
  options?: { cwd?: string; env?: NodeJS.ProcessEnv },
): ExecResult {
  const result = spawnSync(command, args, {
    cwd: options?.cwd,
    env: options?.env ?? process.env,
    encoding: "utf8",
    shell: false,
  });

  return {
    ok: result.status === 0 && !result.error,
    status: result.status,
    stdout: (result.stdout ?? "").trim(),
    stderr: (result.stderr ?? "").trim(),
  };
}

export function which(command: string): string | null {
  const result = runCommand("which", [command]);
  return result.ok ? (result.stdout.split("\n")[0] ?? null) : null;
}
