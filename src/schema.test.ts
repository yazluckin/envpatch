import { validateEnvSchema, formatSchemaValidationSummary } from './schema';
import { EnvRecord } from './parser';
import { EnvSchema } from './schema.types';

const schema: EnvSchema = {
  PORT: { type: 'number', required: true },
  NODE_ENV: { type: 'string', required: true, allowedValues: ['development', 'production', 'test'] },
  API_URL: { type: 'url', required: true },
  ADMIN_EMAIL: { type: 'email' },
  APP_NAME: { type: 'string', minLength: 2, maxLength: 50 },
  DEBUG: { type: 'boolean' },
};

describe('validateEnvSchema', () => {
  it('returns valid for a fully compliant env', () => {
    const env: EnvRecord = {
      PORT: '3000',
      NODE_ENV: 'production',
      API_URL: 'https://api.example.com',
      ADMIN_EMAIL: 'admin@example.com',
      APP_NAME: 'MyApp',
      DEBUG: 'false',
    };
    const result = validateEnvSchema(env, schema, { allowUnknown: true });
    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.missingRequired).toHaveLength(0);
  });

  it('detects missing required fields', () => {
    const env: EnvRecord = { NODE_ENV: 'development', API_URL: 'https://x.com' };
    const result = validateEnvSchema(env, schema, { allowUnknown: true });
    expect(result.valid).toBe(false);
    expect(result.missingRequired).toContain('PORT');
  });

  it('detects type violations', () => {
    const env: EnvRecord = { PORT: 'not-a-number', NODE_ENV: 'development', API_URL: 'https://x.com' };
    const result = validateEnvSchema(env, schema, { allowUnknown: true });
    expect(result.violations.some(v => v.key === 'PORT' && v.rule === 'type')).toBe(true);
  });

  it('detects allowedValues violations', () => {
    const env: EnvRecord = { PORT: '3000', NODE_ENV: 'staging', API_URL: 'https://x.com' };
    const result = validateEnvSchema(env, schema, { allowUnknown: true });
    expect(result.violations.some(v => v.key === 'NODE_ENV' && v.rule === 'allowedValues')).toBe(true);
  });

  it('detects url type violation', () => {
    const env: EnvRecord = { PORT: '3000', NODE_ENV: 'test', API_URL: 'not-a-url' };
    const result = validateEnvSchema(env, schema, { allowUnknown: true });
    expect(result.violations.some(v => v.key === 'API_URL' && v.rule === 'type')).toBe(true);
  });

  it('detects email type violation', () => {
    const env: EnvRecord = { PORT: '3000', NODE_ENV: 'test', API_URL: 'https://x.com', ADMIN_EMAIL: 'not-an-email' };
    const result = validateEnvSchema(env, schema, { allowUnknown: true });
    expect(result.violations.some(v => v.key === 'ADMIN_EMAIL' && v.rule === 'type')).toBe(true);
  });

  it('detects minLength violation', () => {
    const env: EnvRecord = { PORT: '3000', NODE_ENV: 'test', API_URL: 'https://x.com', APP_NAME: 'A' };
    const result = validateEnvSchema(env, schema, { allowUnknown: true });
    expect(result.violations.some(v => v.key === 'APP_NAME' && v.rule === 'minLength')).toBe(true);
  });

  it('detects unknown keys when allowUnknown is false', () => {
    const env: EnvRecord = { PORT: '3000', NODE_ENV: 'test', API_URL: 'https://x.com', MYSTERY_KEY: 'value' };
    const result = validateEnvSchema(env, schema);
    expect(result.unknownKeys).toContain('MYSTERY_KEY');
  });

  it('does not flag unknown keys when allowUnknown is true', () => {
    const env: EnvRecord = { PORT: '3000', NODE_ENV: 'test', API_URL: 'https://x.com', MYSTERY_KEY: 'value' };
    const result = validateEnvSchema(env, schema, { allowUnknown: true });
    expect(result.unknownKeys).toHaveLength(0);
  });
});

describe('formatSchemaValidationSummary', () => {
  it('shows success message when valid', () => {
    const result = { valid: true, violations: [], missingRequired: [], unknownKeys: [] };
    expect(formatSchemaValidationSummary(result)).toContain('✅');
  });

  it('shows violations in summary', () => {
    const result = {
      valid: false,
      violations: [{ key: 'PORT', value: 'abc', rule: 'type', message: '"PORT" must be of type number' }],
      missingRequired: [],
      unknownKeys: [],
    };
    const summary = formatSchemaValidationSummary(result);
    expect(summary).toContain('type');
    expect(summary).toContain('PORT');
  });

  it('shows missing required in summary', () => {
    const result = { valid: false, violations: [], missingRequired: ['API_KEY'], unknownKeys: [] };
    const summary = formatSchemaValidationSummary(result);
    expect(summary).toContain('API_KEY');
    expect(summary).toContain('❌');
  });
});
