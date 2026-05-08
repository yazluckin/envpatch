import { FilterOptions, FilterResult } from './filter.types';

export function filterEnv(
  env: Record<string, string>,
  options: FilterOptions = {}
): FilterResult {
  const { keys, pattern, excludeKeys, excludePattern, onlyDefined, onlyEmpty } = options;

  const kept: Record<string, string> = {};
  const removed: Record<string, string> = {};

  const includePattern = pattern instanceof RegExp ? pattern : pattern ? new RegExp(pattern) : null;
  const exclPattern = excludePattern instanceof RegExp ? excludePattern : excludePattern ? new RegExp(excludePattern) : null;

  for (const [key, value] of Object.entries(env)) {
    let include = true;

    if (keys && keys.length > 0 && !keys.includes(key)) {
      include = false;
    }

    if (include && includePattern && !includePattern.test(key)) {
      include = false;
    }

    if (include && excludeKeys && excludeKeys.includes(key)) {
      include = false;
    }

    if (include && exclPattern && exclPattern.test(key)) {
      include = false;
    }

    if (include && onlyDefined && value === '') {
      include = false;
    }

    if (include && onlyEmpty && value !== '') {
      include = false;
    }

    if (include) {
      kept[key] = value;
    } else {
      removed[key] = value;
    }
  }

  return {
    kept,
    removed,
    keptCount: Object.keys(kept).length,
    removedCount: Object.keys(removed).length,
  };
}

export function formatFilterSummary(result: FilterResult): string {
  const lines: string[] = [];
  lines.push(`Filter: kept ${result.keptCount} key(s), removed ${result.removedCount} key(s).`);
  if (result.removedCount > 0) {
    for (const key of Object.keys(result.removed)) {
      lines.push(`  - ${key}`);
    }
  }
  return lines.join('\n');
}
