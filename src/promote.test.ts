import { promoteEnv, applyPromote, formatPromoteSummary } from './promote';
import type { EnvMap } from './snapshot.types';

const source: EnvMap = {
  API_URL: 'https://api.prod.example.com',
  DB_PASSWORD: 'supersecret',
  FEATURE_FLAG: 'true',
};

const target: EnvMap = {
  API_URL: 'https://api.staging.example.com',
  LOG_LEVEL: 'debug',
};

describe('promoteEnv', () => {
  it('promotes new keys from source to target', () => {
    const result = promoteEnv(source, target);
    expect(result.promoted['FEATURE_FLAG']).toBeDefined();
    expect(result.promoted['FEATURE_FLAG'].to).toBe('true');
  });

  it('skips existing keys when overwrite is false', () => {
    const result = promoteEnv(source, target);
    expect(result.skipped['API_URL']).toBe('already exists');
  });

  it('overwrites existing keys when overwrite is true', () => {
    const result = promoteEnv(source, target, { overwrite: true });
    expect(result.promoted['API_URL']).toBeDefined();
    expect(result.promoted['API_URL'].to).toBe('https://api.prod.example.com');
    expect(result.promoted['API_URL'].from).toBe('https://api.staging.example.com');
  });

  it('skips excluded keys', () => {
    const result = promoteEnv(source, target, { excludeKeys: ['DB_PASSWORD'] });
    expect(result.skipped['DB_PASSWORD']).toBe('excluded');
    expect(result.promoted['DB_PASSWORD']).toBeUndefined();
  });

  it('reports target-only keys in removed list', () => {
    const result = promoteEnv(source, target);
    expect(result.removed).toContain('LOG_LEVEL');
  });
});

describe('applyPromote', () => {
  it('applies promoted keys to target', () => {
    const result = promoteEnv(source, target, { overwrite: true });
    const updated = applyPromote(target, result);
    expect(updated['API_URL']).toBe('https://api.prod.example.com');
    expect(updated['LOG_LEVEL']).toBe('debug');
    expect(updated['FEATURE_FLAG']).toBe('true');
  });

  it('does not mutate original target', () => {
    const result = promoteEnv(source, target);
    applyPromote(target, result);
    expect(target['FEATURE_FLAG']).toBeUndefined();
  });
});

describe('formatPromoteSummary', () => {
  it('masks sensitive values in summary', () => {
    const result = promoteEnv(source, target, { overwrite: true });
    const summary = formatPromoteSummary(result, true);
    expect(summary).toContain('DB_PASSWORD');
    expect(summary).not.toContain('supersecret');
  });

  it('shows plain values when masking disabled', () => {
    const result = promoteEnv(source, target, { overwrite: true });
    const summary = formatPromoteSummary(result, false);
    expect(summary).toContain('supersecret');
  });

  it('includes skipped key count', () => {
    const result = promoteEnv(source, target);
    const summary = formatPromoteSummary(result);
    expect(summary).toContain('Skipped:');
  });
});
