import { diffEnv, formatDiffSummary } from './diff';
import { EnvMap } from './parser';

describe('diffEnv', () => {
  const base: EnvMap = {
    APP_NAME: 'myapp',
    DB_HOST: 'localhost',
    SECRET_KEY: 'abc123',
  };

  const target: EnvMap = {
    APP_NAME: 'myapp',
    DB_HOST: 'prod.example.com',
    API_KEY: 'newkey',
  };

  it('detects added keys', () => {
    const result = diffEnv(base, target);
    const added = result.entries.filter((e) => e.type === 'added');
    expect(added).toHaveLength(1);
    expect(added[0].key).toBe('API_KEY');
  });

  it('detects removed keys', () => {
    const result = diffEnv(base, target);
    const removed = result.entries.filter((e) => e.type === 'removed');
    expect(removed).toHaveLength(1);
    expect(removed[0].key).toBe('SECRET_KEY');
  });

  it('detects modified keys', () => {
    const result = diffEnv(base, target);
    const modified = result.entries.filter((e) => e.type === 'modified');
    expect(modified).toHaveLength(1);
    expect(modified[0].key).toBe('DB_HOST');
  });

  it('detects unchanged keys', () => {
    const result = diffEnv(base, target);
    const unchanged = result.entries.filter((e) => e.type === 'unchanged');
    expect(unchanged).toHaveLength(1);
    expect(unchanged[0].key).toBe('APP_NAME');
  });

  it('does not expose values by default', () => {
    const result = diffEnv(base, target);
    for (const entry of result.entries) {
      expect(entry.oldValue).toBeUndefined();
      expect(entry.newValue).toBeUndefined();
    }
  });

  it('exposes values when requested', () => {
    const result = diffEnv(base, target, true);
    const modified = result.entries.find((e) => e.type === 'modified');
    expect(modified?.oldValue).toBe('localhost');
    expect(modified?.newValue).toBe('prod.example.com');
  });

  it('returns correct summary counts', () => {
    const result = diffEnv(base, target);
    expect(result.summary).toEqual({ added: 1, removed: 1, modified: 1, unchanged: 1 });
  });

  it('sets hasChanges to false for identical maps', () => {
    const result = diffEnv(base, base);
    expect(result.hasChanges).toBe(false);
  });

  it('returns sorted entries by key', () => {
    const result = diffEnv(base, target);
    const keys = result.entries.map((e) => e.key);
    expect(keys).toEqual([...keys].sort());
  });
});

describe('formatDiffSummary', () => {
  it('returns no-change message when there are no changes', () => {
    const result = diffEnv({ A: '1' }, { A: '1' });
    expect(formatDiffSummary(result)).toBe('No changes detected.');
  });

  it('includes change lines when changes exist', () => {
    const result = diffEnv({ A: '1' }, { B: '2' });
    const summary = formatDiffSummary(result);
    expect(summary).toContain('+ 1 added');
    expect(summary).toContain('- 1 removed');
  });
});
