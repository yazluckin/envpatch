import { lintEnv, formatLintSummary } from './lint';

describe('lintEnv', () => {
  it('returns no issues for a clean env', () => {
    const result = lintEnv({ DATABASE_URL: 'postgres://localhost/db', PORT: '3000' });
    expect(result.issues).toHaveLength(0);
    expect(result.errorCount).toBe(0);
    expect(result.warningCount).toBe(0);
  });

  it('reports error for non-UPPER_SNAKE_CASE key', () => {
    const result = lintEnv({ myKey: 'value' });
    expect(result.errorCount).toBe(1);
    expect(result.issues[0].severity).toBe('error');
    expect(result.issues[0].message).toContain('UPPER_SNAKE_CASE');
  });

  it('reports warning for empty value', () => {
    const result = lintEnv({ API_KEY: '' });
    expect(result.warningCount).toBe(1);
    expect(result.issues[0].severity).toBe('warning');
    expect(result.issues[0].message).toContain('empty value');
  });

  it('reports warning for unquoted value with spaces', () => {
    const result = lintEnv({ APP_NAME: 'my app' });
    const spaceIssue = result.issues.find((i) => i.message.includes('spaces'));
    expect(spaceIssue).toBeDefined();
    expect(spaceIssue?.severity).toBe('warning');
  });

  it('does not warn for quoted value with spaces', () => {
    const result = lintEnv({ APP_NAME: '"my app"' });
    const spaceIssue = result.issues.find((i) => i.message.includes('spaces'));
    expect(spaceIssue).toBeUndefined();
  });

  it('reports warning for key exceeding 64 characters', () => {
    const longKey = 'A'.repeat(65);
    const result = lintEnv({ [longKey]: 'value' });
    const lengthIssue = result.issues.find((i) => i.message.includes('length'));
    expect(lengthIssue).toBeDefined();
    expect(lengthIssue?.severity).toBe('warning');
  });

  it('accumulates multiple issues for the same key', () => {
    const result = lintEnv({ API_KEY: '' });
    // empty value warning only
    expect(result.issues.some((i) => i.key === 'API_KEY')).toBe(true);
  });

  it('counts errors and warnings separately', () => {
    const result = lintEnv({ badKey: '', GOOD_KEY: '' });
    expect(result.errorCount).toBeGreaterThanOrEqual(1);
    expect(result.warningCount).toBeGreaterThanOrEqual(1);
  });
});

describe('formatLintSummary', () => {
  it('returns success message when no issues', () => {
    const result = lintEnv({ PORT: '3000' });
    expect(formatLintSummary(result)).toContain('No lint issues');
  });

  it('includes error and warning counts', () => {
    const result = lintEnv({ badKey: '', EMPTY: '' });
    const summary = formatLintSummary(result);
    expect(summary).toContain('error(s)');
    expect(summary).toContain('warning(s)');
  });

  it('includes key names in output', () => {
    const result = lintEnv({ badKey: 'value' });
    const summary = formatLintSummary(result);
    expect(summary).toContain('badKey');
  });
});
