import { EnvMap } from './parser';

export interface GroupResult {
  groups: Record<string, EnvMap>;
  ungrouped: EnvMap;
}

export function groupEnv(env: EnvMap, delimiter = '_'): GroupResult {
  const groups: Record<string, EnvMap> = {};
  const ungrouped: EnvMap = {};

  for (const [key, value] of Object.entries(env)) {
    const delimIndex = key.indexOf(delimiter);
    if (delimIndex > 0) {
      const prefix = key.slice(0, delimIndex);
      const rest = key.slice(delimIndex + 1);
      if (!groups[prefix]) {
        groups[prefix] = {};
      }
      groups[prefix][rest] = value;
    } else {
      ungrouped[key] = value;
    }
  }

  return { groups, ungrouped };
}

export function flattenGroup(prefix: string, group: EnvMap, delimiter = '_'): EnvMap {
  const result: EnvMap = {};
  for (const [key, value] of Object.entries(group)) {
    result[`${prefix}${delimiter}${key}`] = value;
  }
  return result;
}

export function formatGroupSummary(result: GroupResult): string {
  const lines: string[] = [];
  const groupNames = Object.keys(result.groups);

  if (groupNames.length === 0 && Object.keys(result.ungrouped).length === 0) {
    return 'No variables found.';
  }

  for (const prefix of groupNames.sort()) {
    const keys = Object.keys(result.groups[prefix]);
    lines.push(`[${prefix}] (${keys.length} key${keys.length !== 1 ? 's' : ''})`);
    for (const key of keys.sort()) {
      lines.push(`  ${prefix}_${key}`);
    }
  }

  const ungroupedKeys = Object.keys(result.ungrouped);
  if (ungroupedKeys.length > 0) {
    lines.push(`[ungrouped] (${ungroupedKeys.length} key${ungroupedKeys.length !== 1 ? 's' : ''})`);
    for (const key of ungroupedKeys.sort()) {
      lines.push(`  ${key}`);
    }
  }

  return lines.join('\n');
}
