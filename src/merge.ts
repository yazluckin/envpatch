import { EnvMap } from './parser';
import { DiffResult } from './diff';

export type MergeStrategy = 'ours' | 'theirs' | 'prompt';

export interface MergeOptions {
  strategy?: MergeStrategy;
  overwriteExisting?: boolean;
}

export interface MergeResult {
  merged: EnvMap;
  conflicts: string[];
  added: string[];
  overwritten: string[];
}

/**
 * Merges a patch (diff) into a base EnvMap.
 * Returns the merged result along with metadata about what changed.
 */
export function mergeEnv(
  base: EnvMap,
  diff: DiffResult,
  options: MergeOptions = {}
): MergeResult {
  const { strategy = 'theirs', overwriteExisting = false } = options;

  const merged: EnvMap = { ...base };
  const conflicts: string[] = [];
  const added: string[] = [];
  const overwritten: string[] = [];

  for (const [key, change] of Object.entries(diff)) {
    if (change.type === 'added') {
      if (key in merged && !overwriteExisting) {
        conflicts.push(key);
        if (strategy === 'theirs') {
          merged[key] = change.next!;
          overwritten.push(key);
        }
        // 'ours' keeps existing value, no change needed
      } else {
        merged[key] = change.next!;
        added.push(key);
      }
    } else if (change.type === 'removed') {
      delete merged[key];
    } else if (change.type === 'changed') {
      if (merged[key] !== change.prev) {
        conflicts.push(key);
      }
      if (strategy === 'theirs' || !(key in merged)) {
        merged[key] = change.next!;
        overwritten.push(key);
      }
    }
  }

  return { merged, conflicts, added, overwritten };
}

/**
 * Formats a human-readable summary of a merge result.
 */
export function formatMergeSummary(result: MergeResult): string {
  const lines: string[] = [];
  if (result.added.length > 0) {
    lines.push(`Added: ${result.added.join(', ')}`);
  }
  if (result.overwritten.length > 0) {
    lines.push(`Overwritten: ${result.overwritten.join(', ')}`);
  }
  if (result.conflicts.length > 0) {
    lines.push(`Conflicts resolved: ${result.conflicts.join(', ')}`);
  }
  if (lines.length === 0) {
    return 'No changes applied.';
  }
  return lines.join('\n');
}
