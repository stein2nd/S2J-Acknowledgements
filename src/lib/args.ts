export type ParsedArgs = {
  positional: string[];
  flags: Map<string, string | true>;
};

export function parseArgs(argv: string[]): ParsedArgs {
  const positional: string[] = [];
  const flags = new Map<string, string | true>();

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      flags.set("help", true);
      continue;
    }
    if (arg.startsWith("--")) {
      const eq = arg.indexOf("=");
      if (eq !== -1) {
        const key = arg.slice(2, eq);
        flags.set(key, arg.slice(eq + 1));
        continue;
      }
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("-")) {
        flags.set(key, next);
        i++;
      } else {
        flags.set(key, true);
      }
      continue;
    }
    positional.push(arg);
  }

  return { positional, flags };
}

export function flagString(flags: Map<string, string | true>, name: string): string | undefined {
  const v = flags.get(name);
  return v === true || v === undefined ? undefined : v;
}

export function flagBool(flags: Map<string, string | true>, name: string): boolean {
  return flags.has(name);
}
