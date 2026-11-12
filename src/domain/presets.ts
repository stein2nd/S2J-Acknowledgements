export const PRESET_NAMES = ["macos-app", "wordpress", "dir"] as const;
export type PresetName = (typeof PRESET_NAMES)[number];

export function isPresetName(value: string): value is PresetName {
  return (PRESET_NAMES as readonly string[]).includes(value);
}
