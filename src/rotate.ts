import { EnvMap } from './snapshot.types';

export interface RotateOptions {
  /** Keys to rotate (generate new placeholder values for) */
  keys: string[];
  /** Optional prefix for generated placeholder values */
  prefix?: string;
}

export interface RotateResult {
  updated: EnvMap;
  rotated: string[];
  skipped: string[];
}

export interface RotateSummary {
  rotated: string[];
  skipped: string[];
}

/**
 * Rotates specified keys in an env map by replacing their values with
 * a timestamped placeholder, indicating they need to be filled with
 * real secrets before use.
 */
export function rotateEnv(env: EnvMap, options: RotateOptions): RotateResult {
  const { keys, prefix = 'ROTATED' } = options;
  const updated: EnvMap = { ...env };
  const rotated: string[] = [];
  const skipped: string[] = [];

  const timestamp = Date.now();

  for (const key of keys) {
    if (!(key in env)) {
      skipped.push(key);
      continue;
    }
    updated[key] = `${prefix}_${key}_${timestamp}`;
    rotated.push(key);
  }

  return { updated, rotated, skipped };
}

/**
 * Formats a human-readable summary of a rotate operation.
 */
export function formatRotateSummary(summary: RotateSummary): string {
  const lines: string[] = [];

  if (summary.rotated.length > 0) {
    lines.push(`Rotated (${summary.rotated.length}):`);
    for (const key of summary.rotated) {
      lines.push(`  ~ ${key}`);
    }
  }

  if (summary.skipped.length > 0) {
    lines.push(`Skipped — key not found (${summary.skipped.length}):`);
    for (const key of summary.skipped) {
      lines.push(`  ? ${key}`);
    }
  }

  if (lines.length === 0) {
    return 'No keys rotated.';
  }

  return lines.join('\n');
}
