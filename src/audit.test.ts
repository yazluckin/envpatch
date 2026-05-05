import { auditEnv, formatAuditSummary } from './audit';

describe('auditEnv', () => {
  it('returns no issues for a clean env', () => {
    const result = auditEnv({
      DATABASE_URL: 'postgres://localhost:5432/mydb',
      APP_PORT: '3000',
      NODE_ENV: 'production',
    });
    expect(result.issues).toHaveLength(0);
    expect(result.passed).toBe(true);
  });

  it('reports error for empty sensitive key', () => {
    const result = auditEnv({ SECRET_KEY: '' });
    const issue = result.issues.find((i) => i.key === 'SECRET_KEY');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('error');
    expect(result.passed).toBe(false);
  });

  it('reports warn for placeholder sensitive value', () => {
    const result = auditEnv({ API_SECRET: 'changeme' });
    const issue = result.issues.find((i) => i.key === 'API_SECRET' && i.severity === 'warn');
    expect(issue).toBeDefined();
    expect(result.passed).toBe(true);
  });

  it('reports warn for value with leading whitespace', () => {
    const result = auditEnv({ APP_NAME: '  myapp' });
    const issue = result.issues.find((i) => i.key === 'APP_NAME' && i.severity === 'warn');
    expect(issue).toBeDefined();
  });

  it('reports warn for value with trailing whitespace', () => {
    const result = auditEnv({ APP_NAME: 'myapp  ' });
    const issue = result.issues.find((i) => i.key === 'APP_NAME');
    expect(issue?.severity).toBe('warn');
  });

  it('reports info for non-SCREAMING_SNAKE_CASE key', () => {
    const result = auditEnv({ appName: 'myapp' });
    const issue = result.issues.find((i) => i.key === 'appName' && i.severity === 'info');
    expect(issue).toBeDefined();
  });

  it('does not report info for valid SCREAMING_SNAKE_CASE', () => {
    const result = auditEnv({ APP_NAME_2: 'myapp' });
    const caseIssue = result.issues.find(
      (i) => i.key === 'APP_NAME_2' && i.message.includes('SCREAMING_SNAKE_CASE')
    );
    expect(caseIssue).toBeUndefined();
  });

  it('accumulates multiple issues for one key', () => {
    const result = auditEnv({ api_secret: 'password' });
    // lowercase key => info, and sensitive + placeholder => warn
    const keyIssues = result.issues.filter((i) => i.key === 'api_secret');
    expect(keyIssues.length).toBeGreaterThanOrEqual(2);
  });
});

describe('formatAuditSummary', () => {
  it('returns pass message when no issues', () => {
    const summary = formatAuditSummary({ issues: [], passed: true });
    expect(summary).toContain('✅');
  });

  it('includes error icon for error severity', () => {
    const summary = formatAuditSummary({
      issues: [{ key: 'X', severity: 'error', message: 'bad' }],
      passed: false,
    });
    expect(summary).toContain('❌');
    expect(summary).toContain('[ERROR]');
  });

  it('includes warning icon for warn severity', () => {
    const summary = formatAuditSummary({
      issues: [{ key: 'X', severity: 'warn', message: 'caution' }],
      passed: true,
    });
    expect(summary).toContain('⚠️');
    expect(summary).toContain('[WARN]');
  });
});
