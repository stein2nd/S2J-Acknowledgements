import type { ValidateFunction } from "ajv";
import { Ajv2020 } from "ajv/dist/2020.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { AckConfig } from "./ack-config.js";

let compiled: ValidateFunction | undefined;

function getValidator(packageRoot: string) {
  if (!compiled) {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    const schema = JSON.parse(
      readFileSync(join(packageRoot, "schema", "ack.config.schema.json"), "utf8"),
    );
    compiled = ajv.compile(schema);
  }
  return compiled;
}

export function validateAckConfig(
  packageRoot: string,
  config: AckConfig,
): { ok: true } | { ok: false; message: string } {
  const validateFn = getValidator(packageRoot);
  const valid = validateFn(config);
  if (valid) {
    return { ok: true };
  }

  const lines = (validateFn.errors ?? []).map((e) => {
    const path = e.instancePath || "(root)";
    return `${path}: ${e.message ?? "invalid"}`;
  });
  return {
    ok: false,
    message: `ack.config validation failed:\n${lines.map((l) => `  - ${l}`).join("\n")}`,
  };
}
