import * as fs from 'fs';
import { parseEnv, serializeEnv } from './parser';
import { sortEnv, SortOptions, formatSortSummary } from './sort';

export function sortEnvFile(
  filePath: string,
  options: SortOptions = {}
): void {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const env = parseEnv(raw);
  const result = sortEnv(env, options);
  if (result.changed) {
    fs.writeFileSync(filePath, serializeEnv(result.sorted), 'utf-8');
  }
}

export function sortEnvFileAndReport(
  filePath: string,
  options: SortOptions = {}
): string {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const env = parseEnv(raw);
  const result = sortEnv(env, options);
  if (result.changed) {
    fs.writeFileSync(filePath, serializeEnv(result.sorted), 'utf-8');
  }
  return formatSortSummary(result);
}
