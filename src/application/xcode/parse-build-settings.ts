/**
 * Parses `xcodebuild -showBuildSettings` plain-text output.
 */
export function parseBuildSettings(stdout: string): Record<string, string> {
  const settings: Record<string, string> = {};
  for (const line of stdout.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    settings[key] = rawValue.trim().replace(/^"(.*)"$/, "$1");
  }
  return settings;
}

export function appPathFromBuildSettings(settings: Record<string, string>): string | null {
  const productsDir = settings.BUILT_PRODUCTS_DIR;
  if (!productsDir) return null;
  const wrapper = settings.WRAPPER_NAME ?? settings.FULL_PRODUCT_NAME;
  if (!wrapper) return null;
  const name = wrapper.endsWith(".app") ? wrapper : `${wrapper}.app`;
  return `${productsDir}/${name}`;
}
