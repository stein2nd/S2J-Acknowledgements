import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { runDoctor } from "./doctor.js";
import { runGenerate } from "./generate.js";
import { runInit } from "./init.js";

const require = createRequire(import.meta.url);
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export const PACKAGE_VERSION =
  (require(join(packageRoot, "package.json")) as { version?: string }).version ?? "unknown";

const HELP = `S2J Acknowledgements — third-party Acknowledgements generator.

Usage:
  s2j-acknowledgements <command> [options]

Commands:
  init      Host onboarding (ack.config.json, venv/, onot)
  doctor    Check prerequisites
  generate  Run Syft → Feluda → onot pipeline
  help      Show this message

Examples:
  s2j-acknowledgements init --preset dir
  s2j-acknowledgements doctor --config ack.config.json
  s2j-acknowledgements generate --config ack.config.json --dry-run

Documentation: docs/specs.md
`;

function runHelp(): number {
  console.log(HELP);
  return 0;
}

function main(): number {
  const argv = process.argv.slice(2);

  if (argv.length === 0 || argv[0] === "help") {
    return runHelp();
  }

  const first = argv[0];
  const rest = argv.slice(1);

  if (first === "--help" || first === "-h") {
    return runHelp();
  }

  if (first === "--version" || first === "-V") {
    console.log(PACKAGE_VERSION);
    return 0;
  }

  if (first === "init") {
    return runInit(rest);
  }

  if (first === "doctor") {
    return runDoctor(rest);
  }

  if (first === "generate") {
    return runGenerate(rest);
  }

  console.error(`Unknown command: ${first}\n`);
  console.error(HELP);
  return 2;
}

const code = main();
process.exit(code);
