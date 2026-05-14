import { typecheckEnv, formatTypecheckSummary } from './typecheck';
import { TypeCheckRule } from './typecheck.types';

const env = {
  PORT: '3000',
  DEBUG: 'true',
  API_URL: 'https://api.example.com',
  ADMIN_EMAIL: 'admin@example.com',
  CONFIG_JSON: '{"theme":"dark"}',
  NAME: 'myapp',
  BAD_PORT: 'abc',
  BAD_BOOL: 'maybe',
  BAD_URL: 'not-a-url',
  BAD_EMAIL: 'notanemail',
  BAD_JSON: '{broken}',
};

const rules: TypeCheckRule[] = [
  { key: 'PORT', expectedType: 'number' },
  { key: 'DEBUG', expectedType: 'boolean' },
  { key: 'API_URL', expectedType: 'url' },
  { key: 'ADMIN_EMAIL', expectedType: 'email' },
  { key: 'CONFIG_JSON', expectedType: 'json' },
  { key: 'NAME', expectedType: 'string' },
];

describe('typecheckEnv', () => {
  it('marks valid entries correctly', () => {
    const result = typecheckEnv(env, rules);
    expect(result.valid.map(v => v.key)).toEqual(['PORT', 'DEBUG', 'API_URL', 'ADMIN_EMAIL', 'CONFIG_JSON', 'NAME']);
    expect(result.invalid).toHaveLength(0);
    expect(result.missing).toHaveLength(0);
  });

  it('detects invalid number', () => {
    const result = typecheckEnv(env, [{ key: 'BAD_PORT', expectedType: 'number' }]);
    expect(result.invalid).toHaveLength(1);
    expect(result.invalid[0].key).toBe('BAD_PORT');
  });

  it('detects invalid boolean', () => {
    const result = typecheckEnv(env, [{ key: 'BAD_BOOL', expectedType: 'boolean' }]);
    expect(result.invalid[0].key).toBe('BAD_BOOL');
  });

  it('detects invalid url', () => {
    const result = typecheckEnv(env, [{ key: 'BAD_URL', expectedType: 'url' }]);
    expect(result.invalid[0].key).toBe('BAD_URL');
  });

  it('detects invalid email', () => {
    const result = typecheckEnv(env, [{ key: 'BAD_EMAIL', expectedType: 'email' }]);
    expect(result.invalid[0].key).toBe('BAD_EMAIL');
  });

  it('detects invalid json', () => {
    const result = typecheckEnv(env, [{ key: 'BAD_JSON', expectedType: 'json' }]);
    expect(result.invalid[0].key).toBe('BAD_JSON');
  });

  it('reports missing keys', () => {
    const result = typecheckEnv(env, [{ key: 'MISSING_KEY', expectedType: 'string' }]);
    expect(result.missing).toContain('MISSING_KEY');
  });

  it('formats summary for passing result', () => {
    const result = typecheckEnv(env, rules);
    const summary = formatTypecheckSummary(result);
    expect(summary).toContain('passed type validation');
  });

  it('formats summary with errors', () => {
    const result = typecheckEnv(env, [{ key: 'BAD_PORT', expectedType: 'number' }]);
    const summary = formatTypecheckSummary(result);
    expect(summary).toContain('Type errors');
    expect(summary).toContain('BAD_PORT');
  });

  it('formats summary with missing keys', () => {
    const result = typecheckEnv(env, [{ key: 'GHOST', expectedType: 'string' }]);
    const summary = formatTypecheckSummary(result);
    expect(summary).toContain('Missing keys');
    expect(summary).toContain('GHOST');
  });
});
