import * as fs from 'fs';
import { parseEnv } from './parser';
import { compareEnv, formatCompareSummary } from './compare';
import { CompareOptions, CompareResult } from './compare.types';

export function compareEnvFiles(
  leftPath: string,
  rightPath: string,
  options: CompareOptions = {}
): CompareResult {
  const leftRaw = fs.readFileSync(leftPath, 'utf-8');
  const rightRaw = fs.readFileSync(rightPath, 'utf-8');

  const left = parseEnv(leftRaw);
  const right = parseEnv(rightRaw);

  return compareEnv(left, right, options);
}

export function compareEnvFilesAndReport(
  leftPath: string,
  rightPath: string,
  options: CompareOptions = {}
): void {
  const result = compareEnvFiles(leftPath, rightPath, options);
  const summary = formatCompareSummary(result);
  console.log(summary);

  if (!result.isIdentical) {
    process.exitCode = 1;
  }
}
