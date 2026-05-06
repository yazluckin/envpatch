import { EnvMap } from './snapshot.types';

export interface LintIssue {
  key: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface LintResult {
  issues: LintIssue[];
  errorCount: number;
  warningCount: number;
}

const VALID_KEY_PATTERN = /^[A-Z][A-Z0-9_]*$/;
const UPPER_SNAKE_CASE = /^[A-Z0-9_]+$/;

export function lintEnv(env: EnvMap): LintResult {
  const issues: LintIssue[] = [];

  for (const [key, value] of Object.entries(env)) {
    if (!UPPER_SNAKE_CASE.test(key)) {
      issues.push({
        key,
        severity: 'error',
        message: `Key "${key}" is not UPPER_SNAKE_CASE`,
      });
    } else if (!VALID_KEY_PATTERN.test(key)) {
      issues.push({
        key,
        severity: 'warning',
        message: `Key "${key}" should start with a letter`,
      });
    }

    if (value.trim() === '') {
      issues.push({
        key,
        severity: 'warning',
        message: `Key "${key}" has an empty value`,
      });
    }

    if (value.includes(' ') && !value.startsWith('"') && !value.startsWith("'")) {
      issues.push({
        key,
        severity: 'warning',
        message: `Key "${key}" value contains spaces but is not quoted`,
      });
    }

    if (key.length > 64) {
      issues.push({
        key,
        severity: 'warning',
        message: `Key "${key}" exceeds recommended length of 64 characters`,
      });
    }
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  return { issues, errorCount, warningCount };
}

export function formatLintSummary(result: LintResult): string {
  if (result.issues.length === 0) {
    return '✔ No lint issues found.';
  }
  const lines: string[] = [];
  for (const issue of result.issues) {
    const icon = issue.severity === 'error' ? '✖' : '⚠';
    lines.push(`  ${icon} [${issue.severity.toUpperCase()}] ${issue.key}: ${issue.message}`);
  }
  lines.push(`\n${result.errorCount} error(s), ${result.warningCount} warning(s).`);
  return lines.join('\n');
}
