import { trimEnv, formatTrimSummary } from './trim';

describe('trimEnv', () => {
  it('trims leading and trailing whitespace from values', () => {
    const env = { FOO: '  bar  ', BAZ: 'qux' };
    const result = trimEnv(env);
    expect(result.trimmed).toEqual({ FOO: 'bar', BAZ: 'qux' });
    expect(result.changed).toEqual(['FOO']);
  });

  it('returns unchanged record when no trimming needed', () => {
    const env = { FOO: 'bar', BAZ: 'qux' };
    const result = trimEnv(env);
    expect(result.trimmed).toEqual({ FOO: 'bar', BAZ: 'qux' });
    expect(result.changed).toHaveLength(0);
  });

  it('trims multiple values', () => {
    const env = { A: ' hello ', B: '\tworld\t', C: 'clean' };
    const result = trimEnv(env);
    expect(result.trimmed).toEqual({ A: 'hello', B: 'world', C: 'clean' });
    expect(result.changed).toEqual(['A', 'B']);
  });

  it('trims keys when trimKeys option is enabled', () => {
    const env = { ' KEY ': 'value' };
    const result = trimEnv(env, { trimKeys: true });
    expect(result.trimmed).toHaveProperty('KEY', 'value');
    expect(result.changed).toContain(' KEY ');
  });

  it('does not trim keys by default', () => {
    const env = { ' KEY ': 'value' };
    const result = trimEnv(env);
    expect(result.trimmed).toHaveProperty(' KEY ', 'value');
    expect(result.changed).toHaveLength(0);
  });

  it('preserves original in result', () => {
    const env = { FOO: '  bar  ' };
    const result = trimEnv(env);
    expect(result.original).toEqual({ FOO: '  bar  ' });
  });

  it('handles empty string values', () => {
    const env = { FOO: '' };
    const result = trimEnv(env);
    expect(result.trimmed).toEqual({ FOO: '' });
    expect(result.changed).toHaveLength(0);
  });

  it('handles values with only whitespace', () => {
    const env = { FOO: '   ' };
    const result = trimEnv(env);
    expect(result.trimmed).toEqual({ FOO: '' });
    expect(result.changed).toEqual(['FOO']);
  });
});

describe('formatTrimSummary', () => {
  it('reports no changes when nothing trimmed', () => {
    const result = trimEnv({ FOO: 'bar' });
    expect(formatTrimSummary(result)).toBe('No values needed trimming.');
  });

  it('lists changed keys with before/after values', () => {
    const result = trimEnv({ FOO: '  bar  ', BAZ: 'clean' });
    const summary = formatTrimSummary(result);
    expect(summary).toContain('Trimmed 1 value(s):');
    expect(summary).toContain('FOO');
    expect(summary).toContain('"  bar  "');
    expect(summary).toContain('"bar"');
  });
});
