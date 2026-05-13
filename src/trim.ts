import { parseEnv, serializeEnv } from './parser';

export interface TrimResult {
  original: Record<string, string>;
  trimmed: Record<string, string>;
  changed: string[];
}

/**
 * Trims leading/trailing whitespace from all values in a parsed env record.
 * Optionally also trims keys.
 */
export function trimEnv(
  env: Record<string, string>,
  options: { trimKeys?: boolean } = {}
): TrimResult {
  const trimmed: Record<string, string> = {};
  const changed: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    const trimmedKey = options.trimKeys ? key.trim() : key;
    const trimmedValue = value.trim();

    trimmed[trimmedKey] = trimmedValue;

    if (trimmedValue !== value || trimmedKey !== key) {
      changed.push(key);
    }
  }

  return { original: env, trimmed, changed };
}

export function formatTrimSummary(result: TrimResult): string {
  if (result.changed.length === 0) {
    return 'No values needed trimming.';
  }

  const lines: string[] = [`Trimmed ${result.changed.length} value(s):`, ''];

  for (const key of result.changed) {
    const before = JSON.stringify(result.original[key]);
    const after = JSON.stringify(result.trimmed[key]);
    lines.push(`  ${key}: ${before} → ${after}`);
  }

  return lines.join('\n');
}
