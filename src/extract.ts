import { EnvMap } from './parser';
import { ExtractOptions, ExtractResult } from './extract.types';

/**
 * Extract a subset of keys from an env map.
 * Returns the extracted values, which keys were found, and which were missing.
 */
export function extractEnv(
  env: EnvMap,
  options: ExtractOptions
): ExtractResult {
  const { keys, strict = false } = options;
  const extracted: Record<string, string> = {};
  const missing: string[] = [];
  const found: string[] = [];

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(env, key)) {
      extracted[key] = env[key];
      found.push(key);
    } else {
      missing.push(key);
    }
  }

  if (strict && missing.length > 0) {
    throw new Error(
      `extractEnv: missing required keys: ${missing.join(', ')}`
    );
  }

  return { extracted, missing, found };
}

export function formatExtractSummary(result: ExtractResult): string {
  const lines: string[] = [];
  lines.push(`Extracted : ${result.found.length} key(s)`);
  if (result.found.length > 0) {
    result.found.forEach((k) => lines.push(`  ✔ ${k}`));
  }
  if (result.missing.length > 0) {
    lines.push(`Missing   : ${result.missing.length} key(s)`);
    result.missing.forEach((k) => lines.push(`  ✘ ${k}`));
  }
  return lines.join('\n');
}
