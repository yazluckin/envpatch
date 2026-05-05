import { EnvMap } from './snapshot.types';
import { isSensitiveKey } from './mask';

export type AuditSeverity = 'info' | 'warn' | 'error';

export interface AuditIssue {
  key: string;
  severity: AuditSeverity;
  message: string;
}

export interface AuditResult {
  issues: AuditIssue[];
  passed: boolean;
}

/**
 * Audits an env map for common security and quality issues.
 */
export function auditEnv(env: EnvMap): AuditResult {
  const issues: AuditIssue[] = [];

  for (const [key, value] of Object.entries(env)) {
    // Empty values for sensitive keys
    if (isSensitiveKey(key) && (!value || value.trim() === '')) {
      issues.push({
        key,
        severity: 'error',
        message: `Sensitive key "${key}" has an empty value`,
      });
    }

    // Plaintext secrets that look like they might be default/example values
    if (isSensitiveKey(key) && /^(secret|password|changeme|example|test|dummy|placeholder)$/i.test(value)) {
      issues.push({
        key,
        severity: 'warn',
        message: `Sensitive key "${key}" appears to use a default or placeholder value`,
      });
    }

    // Keys with whitespace in value (possible copy-paste issue)
    if (value !== value.trim()) {
      issues.push({
        key,
        severity: 'warn',
        message: `Key "${key}" has leading or trailing whitespace in its value`,
      });
    }

    // Keys not in SCREAMING_SNAKE_CASE
    if (!/^[A-Z][A-Z0-9_]*$/.test(key)) {
      issues.push({
        key,
        severity: 'info',
        message: `Key "${key}" does not follow SCREAMING_SNAKE_CASE convention`,
      });
    }
  }

  const passed = issues.every((i) => i.severity !== 'error');
  return { issues, passed };
}

export function formatAuditSummary(result: AuditResult): string {
  if (result.issues.length === 0) {
    return '✅ Audit passed: no issues found.';
  }

  const lines: string[] = [
    result.passed ? '⚠️  Audit completed with warnings:' : '❌ Audit failed:',
  ];

  for (const issue of result.issues) {
    const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warn' ? '⚠️ ' : 'ℹ️ ';
    lines.push(`  ${icon} [${issue.severity.toUpperCase()}] ${issue.message}`);
  }

  return lines.join('\n');
}
