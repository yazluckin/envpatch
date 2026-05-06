import { syncEnv, formatSyncSummary } from './sync';

const left = { API_URL: 'http://left.example.com', DB_HOST: 'localhost', SECRET_KEY: 'abc' };
const right = { API_URL: 'http://right.example.com', DB_PORT: '5432', SECRET_KEY: 'xyz' };

describe('syncEnv', () => {
  it('adds missing keys to right when direction is right', () => {
    const result = syncEnv(left, right, { direction: 'right' });
    expect(result.rightEnv).toHaveProperty('DB_HOST', 'localhost');
    expect(result.changes.some(c => c.key === 'DB_HOST' && c.direction === 'right')).toBe(true);
  });

  it('adds missing keys to left when direction is left', () => {
    const result = syncEnv(left, right, { direction: 'left' });
    expect(result.leftEnv).toHaveProperty('DB_PORT', '5432');
    expect(result.changes.some(c => c.key === 'DB_PORT' && c.direction === 'left')).toBe(true);
  });

  it('syncs both directions by default', () => {
    const result = syncEnv(left, right);
    expect(result.leftEnv).toHaveProperty('DB_PORT');
    expect(result.rightEnv).toHaveProperty('DB_HOST');
  });

  it('skips conflicting keys when overwrite is false', () => {
    const result = syncEnv(left, right, { overwrite: false });
    expect(result.skipped).toContain('API_URL');
  });

  it('overwrites conflicting keys when overwrite is true', () => {
    const result = syncEnv(left, right, { overwrite: true, direction: 'right' });
    expect(result.rightEnv['API_URL']).toBe('http://left.example.com');
    expect(result.changes.some(c => c.key === 'API_URL' && c.action === 'update')).toBe(true);
  });

  it('skips sensitive keys when skipSensitive is true', () => {
    const result = syncEnv(left, right, { skipSensitive: true });
    expect(result.skipped).toContain('SECRET_KEY');
  });

  it('returns empty changes when envs are identical', () => {
    const env = { FOO: 'bar' };
    const result = syncEnv(env, { ...env });
    expect(result.changes).toHaveLength(0);
  });
});

describe('formatSyncSummary', () => {
  it('reports synced in sync message when no changes', () => {
    const result = syncEnv({ FOO: 'bar' }, { FOO: 'bar' });
    expect(formatSyncSummary(result)).toContain('in sync');
  });

  it('includes added and skipped counts', () => {
    const result = syncEnv(left, right, { skipSensitive: true });
    const summary = formatSyncSummary(result);
    expect(summary).toMatch(/Added/);
    expect(summary).toMatch(/Skipped/);
  });

  it('includes updated count when overwrite is true', () => {
    const result = syncEnv(left, right, { overwrite: true });
    const summary = formatSyncSummary(result);
    expect(summary).toMatch(/Updated/);
  });
});
