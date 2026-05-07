import { EnvMap } from './parser';
import { isSensitiveKey, maskValue } from './mask';
import { CompareOptions, CompareResult, CompareEntry, CompareStatus } from './compare.types';

export function compareEnv(
  left: EnvMap,
  right: EnvMap,
  options: CompareOptions = {}
): CompareResult {
  const { ignoreKeys = [], maskSecrets = true, treatMissingAsEmpty = false } = options;

  const allKeys = new Set([
    ...Object.keys(left),
    ...Object.keys(right),
  ]);

  const entries: CompareEntry[] = [];

  for (const key of allKeys) {
    if (ignoreKeys.includes(key)) continue;

    const hasLeft = Object.prototype.hasOwnProperty.call(left, key);
    const hasRight = Object.prototype.hasOwnProperty.call(right, key);

    let status: CompareStatus;
    let leftValue = hasLeft ? left[key] : undefined;
    let rightValue = hasRight ? right[key] : undefined;

    if (!hasLeft && !hasRight) continue;

    if (!hasLeft) {
      status = treatMissingAsEmpty
        ? rightValue === '' ? 'match' : 'mismatch'
        : 'missing_left';
      leftValue = treatMissingAsEmpty ? '' : undefined;
    } else if (!hasRight) {
      status = treatMissingAsEmpty
        ? leftValue === '' ? 'match' : 'mismatch'
        : 'missing_right';
      rightValue = treatMissingAsEmpty ? '' : undefined;
    } else {
      status = left[key] === right[key] ? 'match' : 'mismatch';
    }

    const sensitive = maskSecrets && isSensitiveKey(key);

    entries.push({
      key,
      status,
      leftValue: leftValue !== undefined ? (sensitive ? maskValue(leftValue) : leftValue) : undefined,
      rightValue: rightValue !== undefined ? (sensitive ? maskValue(rightValue) : rightValue) : undefined,
    });
  }

  entries.sort((a, b) => a.key.localeCompare(b.key));

  const matchCount = entries.filter(e => e.status === 'match').length;
  const mismatchCount = entries.filter(e => e.status === 'mismatch').length;
  const missingLeftCount = entries.filter(e => e.status === 'missing_left').length;
  const missingRightCount = entries.filter(e => e.status === 'missing_right').length;

  return {
    entries,
    totalKeys: entries.length,
    matchCount,
    mismatchCount,
    missingLeftCount,
    missingRightCount,
    isIdentical: mismatchCount === 0 && missingLeftCount === 0 && missingRightCount === 0,
  };
}

export function formatCompareSummary(result: CompareResult): string {
  const lines: string[] = [];

  if (result.isIdentical) {
    lines.push(`✅ Files are identical (${result.matchCount} keys match)`);
    return lines.join('\n');
  }

  lines.push(`📊 Comparison Summary:`);
  lines.push(`  ✅ Match:         ${result.matchCount}`);
  lines.push(`  ⚠️  Mismatch:      ${result.mismatchCount}`);
  lines.push(`  ← Missing left:  ${result.missingLeftCount}`);
  lines.push(`  → Missing right: ${result.missingRightCount}`);

  const issues = result.entries.filter(e => e.status !== 'match');
  if (issues.length > 0) {
    lines.push('');
    for (const entry of issues) {
      if (entry.status === 'mismatch') {
        lines.push(`  ~ ${entry.key}: "${entry.leftValue}" → "${entry.rightValue}"`);
      } else if (entry.status === 'missing_left') {
        lines.push(`  + ${entry.key}: (missing) → "${entry.rightValue}"`);
      } else if (entry.status === 'missing_right') {
        lines.push(`  - ${entry.key}: "${entry.leftValue}" → (missing)`);
      }
    }
  }

  return lines.join('\n');
}
