import fs from 'fs';
import { parseEnv, serializeEnv } from './parser';
import { interpolateEnv, InterpolateOptions, InterpolateResult, formatInterpolateSummary } from './interpolate';

export interface InterpolateFileResult extends InterpolateResult {
  filePath: string;
}

/**
 * Read a .env file, interpolate variable references, and write the result back.
 */
export function interpolateEnvFile(
  filePath: string,
  options: InterpolateOptions = {}
): InterpolateFileResult {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const env = parseEnv(raw);
  const result = interpolateEnv(env, options);
  fs.writeFileSync(filePath, serializeEnv(result.env), 'utf-8');
  return { ...result, filePath };
}

/**
 * Read a .env file, interpolate variable references, and print a summary.
 * Returns true if there were no missing or circular references.
 */
export function interpolateEnvFileAndReport(
  filePath: string,
  options: InterpolateOptions = {}
): boolean {
  let result: InterpolateFileResult;
  try {
    result = interpolateEnvFile(filePath, options);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Interpolation failed: ${message}`);
    return false;
  }

  console.log(formatInterpolateSummary(result));

  const hasIssues = result.missing.length > 0 || result.circular.length > 0;
  return !hasIssues;
}
