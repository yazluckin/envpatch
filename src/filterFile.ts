import * as fs from 'fs';
import { parseEnv, serializeEnv } from './parser';
import { filterEnv, formatFilterSummary } from './filter';
import { FilterOptions, FilterResult } from './filter.types';

export function filterEnvFile(
  inputPath: string,
  outputPath: string,
  options: FilterOptions = {}
): FilterResult {
  const raw = fs.readFileSync(inputPath, 'utf-8');
  const env = parseEnv(raw);
  const result = filterEnv(env, options);
  fs.writeFileSync(outputPath, serializeEnv(result.kept), 'utf-8');
  return result;
}

export function filterEnvFileAndReport(
  inputPath: string,
  outputPath: string,
  options: FilterOptions = {}
): string {
  const result = filterEnvFile(inputPath, outputPath, options);
  return formatFilterSummary(result);
}
