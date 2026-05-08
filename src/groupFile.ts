import { readFileSync } from 'fs';
import { parseEnv } from './parser';
import { groupEnv, formatGroupSummary, GroupResult } from './group';

export function groupEnvFile(
  filePath: string,
  delimiter = '_'
): GroupResult {
  const content = readFileSync(filePath, 'utf-8');
  const env = parseEnv(content);
  return groupEnv(env, delimiter);
}

export function groupEnvFileAndReport(
  filePath: string,
  delimiter = '_'
): string {
  const result = groupEnvFile(filePath, delimiter);
  return formatGroupSummary(result);
}
