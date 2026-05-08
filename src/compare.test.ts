import { compareEnv, formatCompareSummary } from './compare';
import { EnvMap } from './parser';

const base: EnvMap = {
  APP_NAME: 'myapp',
  DATABASE_URL: 'postgres://localhost/dev',
  SECRET_KEY: 'abc123',
  DEBUG: 'true',
};

const other: EnvMap = {
  APP_NAME: 'myapp',
  DATABASE_URL: 'postgres://localhost/prod',
  SECRET_KEY: 'xyz789',
  PORT: '3000',
};

describe('compareEnv', () => {
  it('detects matching keys', () => {
    const result = compareEnv(base, base);
    expect(result.isIdentical).toBe(true);
    expect(result.matchCount).toBe(4);
  });

  it('detects mismatched values', () => {
    const result = compareEnv(base, other);
    const dbEntry = result.entries.find(e => e.key === 'DATABASE_URL');
    expect(dbEntry?.status).toBe('mismatch');
  });

  it('detects missing_right keys', () => {
    const result = compareEnv(base, other);
    const debugEntry = result.entries.find(e => e.key === 'DEBUG');
    expect(debugEntry?.status).toBe('missing_right');
    expect(result.missingRightCount).toBe(1);
  });

  it('detects missing_left keys', () => {
    const result = compareEnv(base, other);
    const portEntry = result.entries.find(e => e.key === 'PORT');
    expect(portEntry?.status).toBe('missing_left');
    expect(result.missingLeftCount).toBe(1);
  });

  it('masks sensitive values by default', () => {
    const result = compareEnv(base, other);
    const secretEntry = result.entries.find(e => e.key === 'SECRET_KEY');
    expect(secretEntry?.leftValue).not.toBe('abc123');
    expect(secretEntry?.rightValue).not.toBe('xyz789');
  });

  it('shows sensitive values when maskSecrets is false', () => {
    const result = compareEnv(base, other, { maskSecrets: false });
    const secretEntry = result.entries.find(e => e.key === 'SECRET_KEY');
    expect(secretEntry?.leftValue).toBe('abc123');
    expect(secretEntry?.rightValue).toBe('xyz789');
  });

  it('ignores specified keys', () => {
    const result = compareEnv(base, other, { ignoreKeys: ['DATABASE_URL', 'PORT', 'DEBUG'] });
    const dbEntry = result.entries.find(e => e.key === 'DATABASE_URL');
    expect(dbEntry).toBeUndefined();
  });

  it('counts totals correctly', () => {
    const result = compareEnv(base, other);
    expect(result.totalKeys).toBe(5);
    expect(result.matchCount).toBe(1); // APP_NAME
    expect(result.mismatchCount).toBe(2); // DATABASE_URL, SECRET_KEY
  });

  it('treatMissingAsEmpty considers missing keys as empty string', () => {
    const left: EnvMap = { A: '' };
    const right: EnvMap = {};
    const result = compareEnv(left, right, { treatMissingAsEmpty: true });
    expect(result.entries.find(e => e.key === 'A')?.status).toBe('match');
  });

  it('returns isIdentical false when there are differences', () => {
    const result = compareEnv(base, other);
    expect(result.isIdentical).toBe(false);
  });
});

describe('formatCompareSummary', () => {
  it('returns identical message when files match', () => {
    const result = compareEnv(base, base);
    const summary = formatCompareSummary(result);
    expect(summary).toContain('identical');
  });

  it('includes mismatch details in summary', () => {
    const result = compareEnv(base, other);
    const summary = formatCompareSummary(result);
    expect(summary).toContain('mismatch');
  });

  it('includes missing key counts in summary', () => {
    const result = compareEnv(base, other);
    const summary = formatCompareSummary(result);
    expect(summary).toContain('missing');
  });
});
