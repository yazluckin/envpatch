import { EnvMap } from './parser';

export interface RenameRule {
  from: string;
  to: string;
}

export interface RenameResult {
  renamed: RenameRule[];
  notFound: string[];
  conflicts: string[];
  output: EnvMap;
}

export function renameEnv(
  env: EnvMap,
  rules: RenameRule[]
): RenameResult {
  const output: EnvMap = { ...env };
  const renamed: RenameRule[] = [];
  const notFound: string[] = [];
  const conflicts: string[] = [];

  for (const rule of rules) {
    const { from, to } = rule;

    if (!(from in output)) {
      notFound.push(from);
      continue;
    }

    if (to in output && to !== from) {
      conflicts.push(to);
      continue;
    }

    const value = output[from];
    delete output[from];
    output[to] = value;
    renamed.push(rule);
  }

  return { renamed, notFound, conflicts, output };
}

export function formatRenameSummary(result: RenameResult): string {
  const lines: string[] = [];

  if (result.renamed.length > 0) {
    lines.push(`Renamed (${result.renamed.length}):`);
    for (const r of result.renamed) {
      lines.push(`  ${r.from} → ${r.to}`);
    }
  }

  if (result.notFound.length > 0) {
    lines.push(`Not found (${result.notFound.length}):`);
    for (const key of result.notFound) {
      lines.push(`  ${key}`);
    }
  }

  if (result.conflicts.length > 0) {
    lines.push(`Conflicts — target key already exists (${result.conflicts.length}):`);
    for (const key of result.conflicts) {
      lines.push(`  ${key}`);
    }
  }

  if (lines.length === 0) {
    lines.push('No rename rules applied.');
  }

  return lines.join('\n');
}
