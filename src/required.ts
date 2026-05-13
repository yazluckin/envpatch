import { EnvMap } from "./parser";

export interface RequiredResult {
  missing: string[];
  present: string[];
  total: number;
}

/**
 * Check which required keys are present or missing in an env map.
 */
export function checkRequired(
  env: EnvMap,
  requiredKeys: string[]
): RequiredResult {
  const missing: string[] = [];
  const present: string[] = [];

  for (const key of requiredKeys) {
    const value = env[key];
    if (value === undefined || value === null || value === "") {
      missing.push(key);
    } else {
      present.push(key);
    }
  }

  return {
    missing,
    present,
    total: requiredKeys.length,
  };
}

/**
 * Returns true if all required keys are present and non-empty.
 */
export function allRequiredPresent(
  env: EnvMap,
  requiredKeys: string[]
): boolean {
  return checkRequired(env, requiredKeys).missing.length === 0;
}

/**
 * Format a human-readable summary of the required key check.
 */
export function formatRequiredSummary(result: RequiredResult): string {
  const lines: string[] = [];

  lines.push(
    `Required keys: ${result.present.length}/${result.total} present`
  );

  if (result.missing.length > 0) {
    lines.push(`Missing (${result.missing.length}):`);
    for (const key of result.missing) {
      lines.push(`  - ${key}`);
    }
  }

  if (result.present.length > 0) {
    lines.push(`Present (${result.present.length}):`);
    for (const key of result.present) {
      lines.push(`  ✓ ${key}`);
    }
  }

  return lines.join("\n");
}
