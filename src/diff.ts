import { EnvMap } from './parser';

export type ChangeType = 'added' | 'removed' | 'changed' | 'unchanged';

export interface EnvChange {
  type: ChangeType;
  prev?: string;
  next?: string;
}

export type DiffResult = Record<string, EnvChange>;

/**
 * Computes the diff between two EnvMaps.
 * Returns only keys that have changed (added, removed, or modified).
 */
export function diffEnv(base: EnvMap, target: EnvMap): DiffResult {
  const result: DiffResult = {};
  const allKeys = new Set([...Object.keys(base), ...Object.keys(target)]);

  for (const key of allKeys) {
    const inBase = key in base;
    const inTarget = key in target;

    if (inBase && !inTarget) {
      result[key] = { type: 'removed', prev: base[key] };
    } else if (!inBase && inTarget) {
      result[key] = { type: 'added', next: target[key] };
    } else if (base[key] !== target[key]) {
      result[key] = { type: 'changed', prev: base[key], next: target[key] };
    }
  }

  return result;
}

/**
 * Formats a human-readable summary of a diff result.
 */
export function formatDiffSummary(diff: DiffResult): string {
  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];

  for (const [key, change] of Object.entries(diff)) {
    if (change.type === 'added') added.push(key);
    else if (change.type === 'removed') removed.push(key);
    else if (change.type === 'changed') changed.push(key);
  }

  const lines: string[] = [];
  if (added.length > 0) lines.push(`+ Added: ${added.join(', ')}`);
  if (removed.length > 0) lines.push(`- Removed: ${removed.join(', ')}`);
  if (changed.length > 0) lines.push(`~ Changed: ${changed.join(', ')}`);
  if (lines.length === 0) return 'No differences found.';
  return lines.join('\n');
}
