import * as fs from 'fs';
import { parseEnv } from './parser';
import { lintEnv, formatLintSummary, LintResult } from './lint';

export function lintEnvFile(filePath: string): LintResult {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  const env = parseEnv(raw);
  return lintEnv(env);
}

export function lintEnvFileAndReport(filePath: string): boolean {
  const result = lintEnvFile(filePath);
  const summary = formatLintSummary(result);
  console.log(summary);
  return result.errorCount === 0;
}
