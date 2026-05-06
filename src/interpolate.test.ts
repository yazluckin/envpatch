import { interpolateEnv, formatInterpolateSummary } from './interpolate';

describe('interpolateEnv', () => {
  it('returns env unchanged when no references exist', () => {
    const env = { HOST: 'localhost', PORT: '5432' };
    const result = interpolateEnv(env);
    expect(result.env).toEqual(env);
    expect(result.resolved).toEqual([]);
    expect(result.missing).toEqual([]);
  });

  it('resolves a simple reference', () => {
    const env = { BASE: 'http://localhost', URL: '${BASE}/api' };
    const result = interpolateEnv(env);
    expect(result.env.URL).toBe('http://localhost/api');
    expect(result.resolved).toContain('BASE');
  });

  it('resolves chained references', () => {
    const env = { PROTO: 'https', HOST: 'example.com', BASE: '${PROTO}://${HOST}', URL: '${BASE}/v1' };
    const result = interpolateEnv(env);
    expect(result.env.URL).toBe('https://example.com/v1');
  });

  it('tracks missing references when allowMissing is true', () => {
    const env = { URL: '${MISSING_VAR}/path' };
    const result = interpolateEnv(env, { allowMissing: true });
    expect(result.missing).toContain('MISSING_VAR');
    expect(result.env.URL).toBe('${MISSING_VAR}/path');
  });

  it('throws on missing reference by default', () => {
    const env = { URL: '${MISSING_VAR}/path' };
    expect(() => interpolateEnv(env)).toThrow('Missing env variable: MISSING_VAR');
  });

  it('detects circular references', () => {
    const env = { A: '${B}', B: '${A}' };
    const result = interpolateEnv(env, { allowMissing: true });
    expect(result.circular.length).toBeGreaterThan(0);
  });

  it('supports custom prefix and suffix', () => {
    const env = { HOST: 'localhost', URL: '{{HOST}}/api' };
    const result = interpolateEnv(env, { prefix: '{{', suffix: '}}' });
    expect(result.env.URL).toBe('localhost/api');
  });

  it('handles multiple references in one value', () => {
    const env = { USER: 'admin', PASS: 'secret', DSN: 'postgres://${USER}:${PASS}@host' };
    const result = interpolateEnv(env);
    expect(result.env.DSN).toBe('postgres://admin:secret@host');
  });
});

describe('formatInterpolateSummary', () => {
  it('reports resolved references', () => {
    const result = { env: {}, resolved: ['BASE'], missing: [], circular: [] };
    expect(formatInterpolateSummary(result)).toContain('Resolved references: BASE');
  });

  it('reports missing references', () => {
    const result = { env: {}, resolved: [], missing: ['MISSING'], circular: [] };
    expect(formatInterpolateSummary(result)).toContain('Missing references: MISSING');
  });

  it('reports no interpolation needed', () => {
    const result = { env: {}, resolved: [], missing: [], circular: [] };
    expect(formatInterpolateSummary(result)).toBe('No interpolation needed.');
  });
});
