import { EnvMap } from './parser';

export interface CloneOptions {
  overwrite?: boolean;
  exclude?: string[];
  include?: string[];
  prefix?: string;
  stripPrefix?: string;
}

export interface CloneResult {
  cloned: Record<string, string>;
  skipped: Record<string, string>;
  excluded: string[];
}

/**
 * Clone keys from a source env into a target env, with optional filtering and prefix manipulation.
 */
export function cloneEnv(
  source: EnvMap,
  target: EnvMap,
  options: CloneOptions = {}
): CloneResult {
  const { overwrite = false, exclude = [], include, prefix = '', stripPrefix = '' } = options;

  const cloned: Record<string, string> = {};
  const skipped: Record<string, string> = {};
  const excluded: string[] = [];

  for (const [key, value] of Object.entries(source)) {
    if (exclude.includes(key)) {
      excluded.push(key);
      continue;
    }

    if (include && !include.includes(key)) {
      excluded.push(key);
      continue;
    }

    let targetKey = key;

    if (stripPrefix && targetKey.startsWith(stripPrefix)) {
      targetKey = targetKey.slice(stripPrefix.length);
    }

    if (prefix) {
      targetKey = `${prefix}${targetKey}`;
    }

    if (!overwrite && targetKey in target) {
      skipped[targetKey] = value;
      continue;
    }

    cloned[targetKey] = value;
  }

  return { cloned, skipped, excluded };
}

export function applyClone(target: EnvMap, result: CloneResult): EnvMap {
  return { ...target, ...result.cloned };
}

export function formatCloneSummary(result: CloneResult): string {
  const lines: string[] = [];
  const clonedCount = Object.keys(result.cloned).length;
  const skippedCount = Object.keys(result.skipped).length;

  lines.push(`Cloned: ${clonedCount} key(s)`);

  if (skippedCount > 0) {
    lines.push(`Skipped (already exist): ${skippedCount} key(s)`);
    for (const key of Object.keys(result.skipped)) {
      lines.push(`  - ${key}`);
    }
  }

  if (result.excluded.length > 0) {
    lines.push(`Excluded: ${result.excluded.length} key(s)`);
  }

  return lines.join('\n');
}
