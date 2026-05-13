import { EnvMap } from './parser';

export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  order?: SortOrder;
  groupByPrefix?: boolean;
}

export interface SortResult {
  original: EnvMap;
  sorted: EnvMap;
  changed: boolean;
}

export function sortEnv(
  env: EnvMap,
  options: SortOptions = {}
): SortResult {
  const { order = 'asc', groupByPrefix = false } = options;

  const keys = Object.keys(env);

  let sortedKeys: string[];

  if (groupByPrefix) {
    const groups = new Map<string, string[]>();
    for (const key of keys) {
      const prefix = key.includes('_') ? key.split('_')[0] : '__ungrouped__';
      if (!groups.has(prefix)) groups.set(prefix, []);
      groups.get(prefix)!.push(key);
    }

    const sortedPrefixes = [...groups.keys()].sort((a, b) =>
      order === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
    );

    sortedKeys = sortedPrefixes.flatMap((prefix) =>
      groups.get(prefix)!.sort((a, b) =>
        order === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
      )
    );
  } else {
    sortedKeys = [...keys].sort((a, b) =>
      order === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
    );
  }

  const sorted: EnvMap = {};
  for (const key of sortedKeys) {
    sorted[key] = env[key];
  }

  const changed = keys.join(',') !== sortedKeys.join(',');

  return { original: env, sorted, changed };
}

export function formatSortSummary(result: SortResult): string {
  if (!result.changed) {
    return 'Keys are already in sorted order. No changes made.';
  }
  const count = Object.keys(result.sorted).length;
  return `Sorted ${count} key${count !== 1 ? 's' : ''}.`;
}
