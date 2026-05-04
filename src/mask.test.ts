import { describe, it, expect } from 'vitest';
import { isSensitiveKey, maskValue, maskEnv } from './mask';

describe('isSensitiveKey', () => {
  it('detects keys containing "secret"', () => {
    expect(isSensitiveKey('MY_SECRET')).toBe(true);
    expect(isSensitiveKey('APP_SECRET_KEY')).toBe(true);
  });

  it('detects keys containing "password" or "passwd"', () => {
    expect(isSensitiveKey('DB_PASSWORD')).toBe(true);
    expect(isSensitiveKey('DB_PASSWD')).toBe(true);
  });

  it('detects keys containing "token"', () => {
    expect(isSensitiveKey('ACCESS_TOKEN')).toBe(true);
    expect(isSensitiveKey('REFRESH_TOKEN')).toBe(true);
  });

  it('detects keys containing "api_key" variants', () => {
    expect(isSensitiveKey('API_KEY')).toBe(true);
    expect(isSensitiveKey('STRIPE_APIKEY')).toBe(true);
  });

  it('does not flag non-sensitive keys', () => {
    expect(isSensitiveKey('NODE_ENV')).toBe(false);
    expect(isSensitiveKey('PORT')).toBe(false);
    expect(isSensitiveKey('DATABASE_URL')).toBe(false);
    expect(isSensitiveKey('APP_NAME')).toBe(false);
  });
});

describe('maskValue', () => {
  it('fully masks a value by default', () => {
    const result = maskValue('supersecret');
    expect(result).toBe('******');
  });

  it('respects revealPrefix option', () => {
    const result = maskValue('supersecret', { revealPrefix: 3 });
    expect(result).toBe('sup********');
  });

  it('uses custom maskChar', () => {
    const result = maskValue('hello', { maskChar: '#' });
    expect(result).toBe('######');
  });

  it('returns empty string for empty value', () => {
    expect(maskValue('')).toBe('');
  });

  it('pads short values to minMaskedLength', () => {
    const result = maskValue('ab', { minMaskedLength: 8 });
    expect(result).toBe('********');
  });
});

describe('maskEnv', () => {
  const env = {
    NODE_ENV: 'production',
    PORT: '3000',
    DB_PASSWORD: 'hunter2',
    API_KEY: 'sk-abc123',
    APP_NAME: 'envpatch',
  };

  it('masks sensitive keys and leaves others unchanged', () => {
    const masked = maskEnv(env);
    expect(masked.NODE_ENV).toBe('production');
    expect(masked.PORT).toBe('3000');
    expect(masked.APP_NAME).toBe('envpatch');
    expect(masked.DB_PASSWORD).toBe('******');
    expect(masked.API_KEY).toBe('******');
  });

  it('passes options through to maskValue', () => {
    const masked = maskEnv(env, { revealPrefix: 2, maskChar: '-' });
    expect(masked.DB_PASSWORD).toBe('hu-----');
    expect(masked.API_KEY).toBe('sk------');
  });

  it('does not mutate the original env object', () => {
    maskEnv(env);
    expect(env.DB_PASSWORD).toBe('hunter2');
  });
});
