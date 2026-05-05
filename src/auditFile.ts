import * as fs from 'fs';
import * as path from 'path';
import { parseEnv } from './parser';
import { auditEnv, formatAuditSummary, AuditResult } from './audit';

/**
 * Reads a .env file and audits its contents.
 * Throws if the file cannot be read.
 */
export function auditEnvFile(filePath: string): AuditResult {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }
  const raw = fs.readFileSync(resolved, 'utf-8');
  const env = parseEnv(raw);
  return auditEnv(env);
}

/**
 * Audits a .env file and prints a human-readable report to stdout.
 * Returns true if the audit passed (no errors), false otherwise.
 */
export function auditEnvFileAndReport(
  filePath: string,
  options: { silent?: boolean } = {}
): boolean {
  let result: AuditResult;

  try {
    result = auditEnvFile(filePath);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (!options.silent) {
      console.error(`❌ Could not audit file: ${message}`);
    }
    return false;
  }

  if (!options.silent) {
    console.log(formatAuditSummary(result));
  }

  return result.passed;
}
