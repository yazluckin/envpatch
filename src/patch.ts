import { EnvMap } from './parser';
import { DiffResult } from './diff';

export interface PatchResult {
  applied: string[];
  skipped: string[];
  patched: EnvMap;
}

export interface PatchOptions {
  overwrite?: boolean;
  dryRun?: boolean;
}

/**
 * Applies a diff result as a patch to a base EnvMap.
 * Only adds new keys and optionally overwrites changed keys.
 */
export function applyPatch(
  base: EnvMap,
  diff: DiffResult,
  options: PatchOptions = {}
): PatchResult {
  const { overwrite = false, dryRun = false } = options;
  const patched: EnvMap = { ...base };
  const applied: string[] = [];
  const skipped: string[] = [];

  for (const key of diff.added) {
    if (!dryRun) {
      patched[key] = diff.target[key];
    }
    applied.push(key);
  }

  for (const key of diff.changed) {
    if (overwrite) {
      if (!dryRun) {
        patched[key] = diff.target[key];
      }
      applied.push(key);
    } else {
      skipped.push(key);
    }
  }

  for (const key of diff.removed) {
    if (overwrite) {
      if (!dryRun) {
        delete patched[key];
      }
      applied.push(key);
    } else {
      skipped.push(key);
    }
  }

  return { applied, skipped, patched };
}

/**
 * Formats a human-readable summary of the patch result.
 */
export function formatPatchSummary(result: PatchResult): string {
  const lines: string[] = [];
  lines.push(`Patch summary:`);
  lines.push(`  Applied : ${result.applied.length} key(s)`);
  lines.push(`  Skipped : ${result.skipped.length} key(s)`);
  if (result.skipped.length > 0) {
    lines.push(`  Skipped keys: ${result.skipped.join(', ')}`);
  }
  return lines.join('\n');
}
