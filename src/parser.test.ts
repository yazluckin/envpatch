import { parseEnv, serializeEnv, EnvMap } from './parser';

describe('parseEnv', () => {
  it('parses simple key=value pairs', () => {
    const result = parseEnv('FOO=bar\nBAZ=qux\n');
    expect(result.get('FOO')).toBe('bar');
    expect(result.get('BAZ')).toBe('qux');
  });

  it('ignores comment lines', () => {
    const result = parseEnv('# This is a comment\nFOO=bar\n');
    expect(result.size).toBe(1);
    expect(result.get('FOO')).toBe('bar');
  });

  it('ignores blank lines', () => {
    const result = parseEnv('\nFOO=bar\n\nBAZ=qux\n');
    expect(result.size).toBe(2);
  });

  it('strips double-quoted values', () => {
    const result = parseEnv('FOO="hello world"\n');
    expect(result.get('FOO')).toBe('hello world');
  });

  it('strips single-quoted values', () => {
    const result = parseEnv("FOO='hello world'\n");
    expect(result.get('FOO')).toBe('hello world');
  });

  it('strips inline comments from unquoted values', () => {
    const result = parseEnv('FOO=bar # a comment\n');
    expect(result.get('FOO')).toBe('bar');
  });

  it('handles values with equals signs', () => {
    const result = parseEnv('TOKEN=abc=def==\n');
    expect(result.get('TOKEN')).toBe('abc=def==');
  });

  it('returns empty map for empty input', () => {
    const result = parseEnv('');
    expect(result.size).toBe(0);
  });
});

describe('serializeEnv', () => {
  it('serializes a map to env format', () => {
    const map: EnvMap = new Map([['FOO', 'bar'], ['BAZ', 'qux']]);
    const result = serializeEnv(map);
    expect(result).toContain('FOO=bar');
    expect(result).toContain('BAZ=qux');
  });

  it('quotes values with spaces', () => {
    const map: EnvMap = new Map([['FOO', 'hello world']]);
    const result = serializeEnv(map);
    expect(result).toContain('FOO="hello world"');
  });

  it('returns empty string for empty map', () => {
    const result = serializeEnv(new Map());
    expect(result).toBe('');
  });

  it('round-trips a parsed env file', () => {
    const original = 'FOO=bar\nBAZ="hello world"\n';
    const parsed = parseEnv(original);
    const serialized = serializeEnv(parsed);
    const reparsed = parseEnv(serialized);
    expect(reparsed.get('FOO')).toBe('bar');
    expect(reparsed.get('BAZ')).toBe('hello world');
  });
});
