type PlainObject = Record<string, unknown>;

const DEEP_KEYS = new Set(["pipeline", "xcode", "scan", "syft", "tools"]);

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Preset defaults + host config (docs/domain.md).
 * Arrays in host replace preset arrays entirely.
 */
export function mergeHostConfig(presetDefaults: PlainObject, host: PlainObject): PlainObject {
  const out: PlainObject = { ...presetDefaults };

  for (const [key, hostValue] of Object.entries(host)) {
    if (Array.isArray(hostValue)) {
      out[key] = hostValue;
      continue;
    }
    if (DEEP_KEYS.has(key) && isPlainObject(hostValue) && isPlainObject(out[key])) {
      out[key] = { ...(out[key] as PlainObject), ...hostValue };
      continue;
    }
    out[key] = hostValue;
  }

  return out;
}
