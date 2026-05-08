import { extractEnv, formatExtractSummary } from './extract';
import { EnvMap } from './parser';

const base: EnvMap = {
  APP_NAME: 'myapp',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  SECRET_KEY: 'supersecret',
};

describe('extractEnv', () => {
  it('extracts requested keys that exist', () => {
    const result = extractEnv(base, { keys: ['APP_NAME', 'DB_HOST'] });
    expect(result.extracted).toEqual({ APP_NAME: 'myapp', DB_HOST: 'localhost' });
    expect(result.found).toEqual(['APP_NAME', 'DB_HOST']);
    expect(result.missing).toEqual([]);
  });

  it('reports missing keys when strict is false', () => {
    const result = extractEnv(base, { keys: ['APP_NAME', 'MISSING_KEY'] });
    expect(result.extracted).toEqual({ APP_NAME: 'myapp' });
    expect(result.found).toEqual(['APP_NAME']);
    expect(result.missing).toEqual(['MISSING_KEY']);
  });

  it('throws when strict is true and a key is missing', () => {
    expect(() =>
      extractEnv(base, { keys: ['APP_NAME', 'NOPE'], strict: true })
    ).toThrow(/missing required keys: NOPE/);
  });

  it('returns empty extracted when keys array is empty', () => {
    const result = extractEnv(base, { keys: [] });
    expect(result.extracted).toEqual({});
    expect(result.found).toEqual([]);
    expect(result.missing).toEqual([]);
  });

  it('extracts all keys when all are present', () => {
    const keys = Object.keys(base);
    const result = extractEnv(base, { keys });
    expect(result.extracted).toEqual(base);
    expect(result.missing).toEqual([]);
  });

  it('handles duplicate keys in the keys array gracefully', () => {
    const result = extractEnv(base, { keys: ['APP_NAME', 'APP_NAME'] });
    expect(result.found).toEqual(['APP_NAME', 'APP_NAME']);
    expect(result.extracted['APP_NAME']).toBe('myapp');
  });
});

describe('formatExtractSummary', () => {
  it('includes found and missing counts', () => {
    const result = extractEnv(base, { keys: ['APP_NAME', 'GHOST'] });
    const summary = formatExtractSummary(result);
    expect(summary).toContain('Extracted : 1 key(s)');
    expect(summary).toContain('Missing   : 1 key(s)');
    expect(summary).toContain('✔ APP_NAME');
    expect(summary).toContain('✘ GHOST');
  });

  it('omits missing section when all keys found', () => {
    const result = extractEnv(base, { keys: ['DB_PORT'] });
    const summary = formatExtractSummary(result);
    expect(summary).not.toContain('Missing');
    expect(summary).toContain('✔ DB_PORT');
  });
});
