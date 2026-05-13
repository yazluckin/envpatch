import { EnvMap } from "./parser";

export interface DefaultsResult {
  applied: Record<string, string>;
  skipped: Record<string, string>;
  output: EnvMap;
}

/**
 * Apply default values to an env map.
 * Only sets a key if it is missing or empty in the source.
 */
export function applyDefaults(
  source: EnvMap,
  defaults: EnvMap,
  overwriteEmpty = true
): DefaultsResult {
  const applied: Record<string, string> = {};
  const skipped: Record<string, string> = {};
  const output: EnvMap = { ...source };

  for (const [key, value] of Object.entries(defaults)) {
    const existing = source[key];
    const isMissing = existing === undefined;
    const isEmpty = existing === "";

    if (isMissing || (overwriteEmpty && isEmpty)) {
      output[key] = value;
      applied[key] = value;
    } else {
      skipped[key] = existing as string;
    }
  }

  return { applied, skipped, output };
}

export function formatDefaultsSummary(result: DefaultsResult): string {
  const lines: string[] = [];

  const appliedKeys = Object.keys(result.applied);
  const skippedKeys = Object.keys(result.skipped);

  if (appliedKeys.length === 0 && skippedKeys.length === 0) {
    return "No defaults to apply.";
  }

  if (appliedKeys.length > 0) {
    lines.push(`Applied ${appliedKeys.length} default(s):`);
    for (const key of appliedKeys) {
      lines.push(`  + ${key}`);
    }
  }

  if (skippedKeys.length > 0) {
    lines.push(`Skipped ${skippedKeys.length} key(s) (already set):`);
    for (const key of skippedKeys) {
      lines.push(`  ~ ${key}`);
    }
  }

  return lines.join("\n");
}
