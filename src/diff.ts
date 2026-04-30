import { EnvMap } from './parser';

export type ChangeType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface DiffEntry {
  key: string;
  type: ChangeType;
  oldValue?: string;
  newValue?: string;
}

export interface DiffResult {
  entries: DiffEntry[];
  hasChanges: boolean;
  summary: {
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
  };
}

/**
 * Computes a diff between two env maps.
 * Values are compared but not exposed in the result for security.
 * @param base - The base/original env map
 * @param target - The target/new env map
 * @param exposeValues - Whether to include actual values in the diff (default: false)
 */
export function diffEnv(
  base: EnvMap,
  target: EnvMap,
  exposeValues = false
): DiffResult {
  const entries: DiffEntry[] = [];
  const allKeys = new Set([...Object.keys(base), ...Object.keys(target)]);

  const summary = { added: 0, removed: 0, modified: 0, unchanged: 0 };

  for (const key of [...allKeys].sort()) {
    const inBase = Object.prototype.hasOwnProperty.call(base, key);
    const inTarget = Object.prototype.hasOwnProperty.call(target, key);

    if (!inBase && inTarget) {
      summary.added++;
      entries.push({
        key,
        type: 'added',
        newValue: exposeValues ? target[key] : undefined,
      });
    } else if (inBase && !inTarget) {
      summary.removed++;
      entries.push({
        key,
        type: 'removed',
        oldValue: exposeValues ? base[key] : undefined,
      });
    } else if (base[key] !== target[key]) {
      summary.modified++;
      entries.push({
        key,
        type: 'modified',
        oldValue: exposeValues ? base[key] : undefined,
        newValue: exposeValues ? target[key] : undefined,
      });
    } else {
      summary.unchanged++;
      entries.push({ key, type: 'unchanged' });
    }
  }

  return {
    entries,
    hasChanges: summary.added + summary.removed + summary.modified > 0,
    summary,
  };
}

/**
 * Returns a human-readable summary of the diff.
 */
export function formatDiffSummary(diff: DiffResult): string {
  const { added, removed, modified, unchanged } = diff.summary;
  const lines: string[] = [];

  if (!diff.hasChanges) {
    return 'No changes detected.';
  }

  if (added > 0) lines.push(`  + ${added} added`);
  if (removed > 0) lines.push(`  - ${removed} removed`);
  if (modified > 0) lines.push(`  ~ ${modified} modified`);
  if (unchanged > 0) lines.push(`    ${unchanged} unchanged`);

  return lines.join('\n');
}
