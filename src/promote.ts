import { EnvMap } from './snapshot.types';
import { isSensitiveKey, maskValue } from './mask';

export interface PromoteOptions {
  overwrite?: boolean;
  dryRun?: boolean;
  excludeKeys?: string[];
}

export interface PromoteResult {
  promoted: Record<string, { from: string | undefined; to: string }>;
  skipped: Record<string, string>;
  removed: string[];
}

/**
 * Promote values from a source env into a target env.
 * Only keys present in source are considered.
 * Keys in excludeKeys are skipped.
 */
export function promoteEnv(
  source: EnvMap,
  target: EnvMap,
  options: PromoteOptions = {}
): PromoteResult {
  const { overwrite = false, excludeKeys = [] } = options;
  const promoted: PromoteResult['promoted'] = {};
  const skipped: PromoteResult['skipped'] = {};
  const removed: string[] = [];

  for (const [key, value] of Object.entries(source)) {
    if (excludeKeys.includes(key)) {
      skipped[key] = 'excluded';
      continue;
    }
    const existing = target[key];
    if (existing !== undefined && !overwrite) {
      skipped[key] = 'already exists';
      continue;
    }
    promoted[key] = { from: existing, to: value };
  }

  // Track keys in target not in source (informational)
  for (const key of Object.keys(target)) {
    if (!(key in source) && !excludeKeys.includes(key)) {
      removed.push(key);
    }
  }

  return { promoted, skipped, removed };
}

export function applyPromote(target: EnvMap, result: PromoteResult): EnvMap {
  const next = { ...target };
  for (const [key, { to }] of Object.entries(result.promoted)) {
    next[key] = to;
  }
  return next;
}

/**
 * Returns true if the promote result contains no promoted keys,
 * meaning the source had no new or overwritable values for the target.
 */
export function isPromoteResultEmpty(result: PromoteResult): boolean {
  return Object.keys(result.promoted).length === 0;
}

export function formatPromoteSummary(
  result: PromoteResult,
  maskSecrets = true
): string {
  const lines: string[] = [];
  const promotedKeys = Object.keys(result.promoted);
  const skippedKeys = Object.keys(result.skipped);

  lines.push(`Promoted: ${promotedKeys.length} key(s)`);
  for (const [key, { from, to }] of Object.entries(result.promoted)) {
    const display = maskSecrets && isSensitiveKey(key) ? maskValue(to) : to;
    const prev = from === undefined ? '(new)' : maskSecrets && isSensitiveKey(key) ? maskValue(from) : from;
    lines.push(`  + ${key}: ${prev} → ${display}`);
  }

  if (skippedKeys.length > 0) {
    lines.push(`Skipped: ${skippedKeys.length} key(s)`);
    for (const [key, reason] of Object.entries(result.skipped)) {
      lines.push(`  ~ ${key} (${reason})`);
    }
  }

  if (result.removed.length > 0) {
    lines.push(`Target-only keys (not promoted): ${result.removed.join(', ')}`);
  }

  return lines.join('\n');
}
