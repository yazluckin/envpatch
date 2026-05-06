import { isSensitiveKey } from './mask';
import { SyncOptions, SyncResult, SyncChange } from './sync.types';

export function syncEnv(
  left: Record<string, string>,
  right: Record<string, string>,
  options: SyncOptions = {}
): SyncResult {
  const { direction = 'both', overwrite = false, skipSensitive = false } = options;

  const changes: SyncChange[] = [];
  const skipped: string[] = [];
  const newLeft = { ...left };
  const newRight = { ...right };

  const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);

  for (const key of allKeys) {
    if (skipSensitive && isSensitiveKey(key)) {
      skipped.push(key);
      continue;
    }

    const inLeft = key in left;
    const inRight = key in right;

    if (inLeft && !inRight && (direction === 'right' || direction === 'both')) {
      newRight[key] = left[key];
      changes.push({ key, direction: 'right', fromValue: left[key], toValue: undefined, action: 'add' });
    } else if (!inLeft && inRight && (direction === 'left' || direction === 'both')) {
      newLeft[key] = right[key];
      changes.push({ key, direction: 'left', fromValue: undefined, toValue: right[key], action: 'add' });
    } else if (inLeft && inRight && left[key] !== right[key]) {
      if (overwrite) {
        if (direction === 'right' || direction === 'both') {
          newRight[key] = left[key];
          changes.push({ key, direction: 'right', fromValue: left[key], toValue: right[key], action: 'update' });
        } else if (direction === 'left') {
          newLeft[key] = right[key];
          changes.push({ key, direction: 'left', fromValue: right[key], toValue: left[key], action: 'update' });
        }
      } else {
        skipped.push(key);
      }
    }
  }

  return { changes, leftEnv: newLeft, rightEnv: newRight, skipped };
}

export function formatSyncSummary(result: SyncResult): string {
  const lines: string[] = [];
  const added = result.changes.filter(c => c.action === 'add');
  const updated = result.changes.filter(c => c.action === 'update');

  if (result.changes.length === 0 && result.skipped.length === 0) {
    lines.push('Environments are already in sync.');
    return lines.join('\n');
  }

  if (added.length > 0) {
    lines.push(`Added (${added.length}):`);
    for (const c of added) {
      lines.push(`  ${c.direction === 'right' ? '→' : '←'} ${c.key}`);
    }
  }

  if (updated.length > 0) {
    lines.push(`Updated (${updated.length}):`);
    for (const c of updated) {
      lines.push(`  ${c.direction === 'right' ? '→' : '←'} ${c.key}`);
    }
  }

  if (result.skipped.length > 0) {
    lines.push(`Skipped (${result.skipped.length}): ${result.skipped.join(', ')}`);
  }

  return lines.join('\n');
}
