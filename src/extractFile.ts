import * as fs from 'fs';
import { parseEnv, serializeEnv } from './parser';
import { extractEnv, formatExtractSummary } from './extract';
import { ExtractOptions, ExtractResult } from './extract.types';

/**
 * Read an .env file, extract the requested keys, and write the result to an
 * output file (or return the result object for programmatic use).
 */
export function extractEnvFile(
  inputPath: string,
  outputPath: string,
  options: ExtractOptions
): ExtractResult {
  const raw = fs.readFileSync(inputPath, 'utf-8');
  const env = parseEnv(raw);
  const result = extractEnv(env, options);
  const serialized = serializeEnv(result.extracted);
  fs.writeFileSync(outputPath, serialized, 'utf-8');
  return result;
}

export function extractEnvFileAndReport(
  inputPath: string,
  outputPath: string,
  options: ExtractOptions
): string {
  const result = extractEnvFile(inputPath, outputPath, options);
  return formatExtractSummary(result);
}
