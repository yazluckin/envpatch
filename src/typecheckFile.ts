import * as fs from 'fs';
import { parseEnv } from './parser';
import { typecheckEnv, formatTypecheckSummary } from './typecheck';
import { TypeCheckRule, TypeCheckResult } from './typecheck.types';

export function typecheckEnvFile(filePath: string, rules: TypeCheckRule[]): TypeCheckResult {
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = parseEnv(content);
  return typecheckEnv(env, rules);
}

export function typecheckEnvFileAndReport(filePath: string, rules: TypeCheckRule[]): string {
  const result = typecheckEnvFile(filePath, rules);
  const summary = formatTypecheckSummary(result);
  const hasErrors = result.invalid.length > 0 || result.missing.length > 0;
  const status = hasErrors ? '✗ Type check failed' : '✓ Type check passed';
  return `${status}\n${summary}`;
}
