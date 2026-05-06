import { rotateEnv, formatRotateSummary } from './rotate';

const baseEnv = {
  DB_PASSWORD: 'supersecret',
  API_KEY: 'abc123',
  APP_NAME: 'myapp',
};

describe('rotateEnv', () => {
  it('rotates existing keys with placeholder values', () => {
    const result = rotateEnv(baseEnv, { keys: ['DB_PASSWORD', 'API_KEY'] });
    expect(result.rotated).toEqual(['DB_PASSWORD', 'API_KEY']);
    expect(result.skipped).toEqual([]);
    expect(result.updated['DB_PASSWORD']).toMatch(/^ROTATED_DB_PASSWORD_\d+$/);
    expect(result.updated['API_KEY']).toMatch(/^ROTATED_API_KEY_\d+$/);
  });

  it('preserves non-rotated keys unchanged', () => {
    const result = rotateEnv(baseEnv, { keys: ['DB_PASSWORD'] });
    expect(result.updated['APP_NAME']).toBe('myapp');
  });

  it('skips keys that do not exist in the env', () => {
    const result = rotateEnv(baseEnv, { keys: ['MISSING_KEY'] });
    expect(result.skipped).toEqual(['MISSING_KEY']);
    expect(result.rotated).toEqual([]);
  });

  it('uses a custom prefix when provided', () => {
    const result = rotateEnv(baseEnv, { keys: ['API_KEY'], prefix: 'REPLACE_ME' });
    expect(result.updated['API_KEY']).toMatch(/^REPLACE_ME_API_KEY_\d+$/);
  });

  it('handles empty keys array gracefully', () => {
    const result = rotateEnv(baseEnv, { keys: [] });
    expect(result.rotated).toEqual([]);
    expect(result.skipped).toEqual([]);
    expect(result.updated).toEqual(baseEnv);
  });

  it('does not mutate the original env map', () => {
    const original = { ...baseEnv };
    rotateEnv(baseEnv, { keys: ['DB_PASSWORD'] });
    expect(baseEnv).toEqual(original);
  });
});

describe('formatRotateSummary', () => {
  it('formats rotated keys', () => {
    const output = formatRotateSummary({ rotated: ['DB_PASSWORD', 'API_KEY'], skipped: [] });
    expect(output).toContain('Rotated (2):');
    expect(output).toContain('~ DB_PASSWORD');
    expect(output).toContain('~ API_KEY');
  });

  it('formats skipped keys', () => {
    const output = formatRotateSummary({ rotated: [], skipped: ['GHOST_KEY'] });
    expect(output).toContain('Skipped');
    expect(output).toContain('? GHOST_KEY');
  });

  it('returns a no-op message when nothing happened', () => {
    const output = formatRotateSummary({ rotated: [], skipped: [] });
    expect(output).toBe('No keys rotated.');
  });
});
