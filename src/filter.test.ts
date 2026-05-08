import { filterEnv, formatFilterSummary } from './filter';

const env = {
  APP_NAME: 'myapp',
  APP_PORT: '3000',
  DB_HOST: 'localhost',
  DB_PASSWORD: 'secret',
  EMPTY_KEY: '',
  FEATURE_FLAG: 'true',
};

describe('filterEnv', () => {
  it('returns all keys when no options provided', () => {
    const result = filterEnv(env);
    expect(result.keptCount).toBe(6);
    expect(result.removedCount).toBe(0);
  });

  it('filters by explicit key list', () => {
    const result = filterEnv(env, { keys: ['APP_NAME', 'APP_PORT'] });
    expect(Object.keys(result.kept)).toEqual(['APP_NAME', 'APP_PORT']);
    expect(result.removedCount).toBe(4);
  });

  it('filters by string pattern', () => {
    const result = filterEnv(env, { pattern: '^APP_' });
    expect(Object.keys(result.kept)).toEqual(['APP_NAME', 'APP_PORT']);
  });

  it('filters by RegExp pattern', () => {
    const result = filterEnv(env, { pattern: /^DB_/ });
    expect(Object.keys(result.kept)).toEqual(['DB_HOST', 'DB_PASSWORD']);
  });

  it('excludes by key list', () => {
    const result = filterEnv(env, { excludeKeys: ['DB_PASSWORD', 'EMPTY_KEY'] });
    expect(result.kept).not.toHaveProperty('DB_PASSWORD');
    expect(result.kept).not.toHaveProperty('EMPTY_KEY');
    expect(result.keptCount).toBe(4);
  });

  it('excludes by pattern', () => {
    const result = filterEnv(env, { excludePattern: '^DB_' });
    expect(result.kept).not.toHaveProperty('DB_HOST');
    expect(result.kept).not.toHaveProperty('DB_PASSWORD');
  });

  it('filters onlyDefined removes empty values', () => {
    const result = filterEnv(env, { onlyDefined: true });
    expect(result.kept).not.toHaveProperty('EMPTY_KEY');
    expect(result.keptCount).toBe(5);
  });

  it('filters onlyEmpty keeps only empty values', () => {
    const result = filterEnv(env, { onlyEmpty: true });
    expect(Object.keys(result.kept)).toEqual(['EMPTY_KEY']);
    expect(result.keptCount).toBe(1);
  });

  it('combines pattern and excludeKeys', () => {
    const result = filterEnv(env, { pattern: /^DB_/, excludeKeys: ['DB_PASSWORD'] });
    expect(Object.keys(result.kept)).toEqual(['DB_HOST']);
  });

  it('populates removed record correctly', () => {
    const result = filterEnv(env, { keys: ['APP_NAME'] });
    expect(result.removed).toHaveProperty('DB_HOST');
    expect(result.removed['APP_PORT']).toBe('3000');
  });
});

describe('formatFilterSummary', () => {
  it('shows kept and removed counts', () => {
    const result = filterEnv(env, { keys: ['APP_NAME'] });
    const summary = formatFilterSummary(result);
    expect(summary).toContain('kept 1 key(s)');
    expect(summary).toContain('removed 5 key(s)');
  });

  it('lists removed keys', () => {
    const result = filterEnv(env, { excludeKeys: ['DB_PASSWORD'] });
    const summary = formatFilterSummary(result);
    expect(summary).toContain('DB_PASSWORD');
  });

  it('shows no removed keys when all kept', () => {
    const result = filterEnv(env);
    const summary = formatFilterSummary(result);
    expect(summary).toContain('removed 0 key(s)');
    expect(summary).not.toContain('  - ');
  });
});
