import { cloneEnv, applyClone, formatCloneSummary } from './clone';
import { EnvMap } from './parser';

const source: EnvMap = {
  APP_NAME: 'myapp',
  APP_SECRET: 'supersecret',
  DB_HOST: 'localhost',
  DB_PASS: 'password',
};

const target: EnvMap = {
  APP_NAME: 'existing',
  EXTRA_KEY: 'keep',
};

describe('cloneEnv', () => {
  it('clones all keys when no options provided', () => {
    const result = cloneEnv(source, {});
    expect(result.cloned).toEqual(source);
    expect(result.skipped).toEqual({});
    expect(result.excluded).toEqual([]);
  });

  it('skips existing keys when overwrite is false', () => {
    const result = cloneEnv(source, target, { overwrite: false });
    expect(result.cloned).not.toHaveProperty('APP_NAME');
    expect(result.skipped).toHaveProperty('APP_NAME');
  });

  it('overwrites existing keys when overwrite is true', () => {
    const result = cloneEnv(source, target, { overwrite: true });
    expect(result.cloned).toHaveProperty('APP_NAME', 'myapp');
    expect(result.skipped).toEqual({});
  });

  it('excludes specified keys', () => {
    const result = cloneEnv(source, {}, { exclude: ['APP_SECRET', 'DB_PASS'] });
    expect(result.cloned).not.toHaveProperty('APP_SECRET');
    expect(result.cloned).not.toHaveProperty('DB_PASS');
    expect(result.excluded).toContain('APP_SECRET');
    expect(result.excluded).toContain('DB_PASS');
  });

  it('only includes specified keys', () => {
    const result = cloneEnv(source, {}, { include: ['APP_NAME', 'DB_HOST'] });
    expect(Object.keys(result.cloned)).toEqual(['APP_NAME', 'DB_HOST']);
    expect(result.excluded).toContain('APP_SECRET');
  });

  it('adds prefix to cloned keys', () => {
    const result = cloneEnv({ FOO: 'bar' }, {}, { prefix: 'TEST_' });
    expect(result.cloned).toHaveProperty('TEST_FOO', 'bar');
    expect(result.cloned).not.toHaveProperty('FOO');
  });

  it('strips prefix from cloned keys', () => {
    const result = cloneEnv({ PROD_FOO: 'bar', PROD_BAZ: 'qux' }, {}, { stripPrefix: 'PROD_' });
    expect(result.cloned).toHaveProperty('FOO', 'bar');
    expect(result.cloned).toHaveProperty('BAZ', 'qux');
  });
});

describe('applyClone', () => {
  it('merges cloned keys into target', () => {
    const result = cloneEnv(source, target, { overwrite: false });
    const merged = applyClone(target, result);
    expect(merged).toHaveProperty('EXTRA_KEY', 'keep');
    expect(merged).toHaveProperty('APP_NAME', 'existing');
    expect(merged).toHaveProperty('DB_HOST', 'localhost');
  });
});

describe('formatCloneSummary', () => {
  it('reports cloned and skipped counts', () => {
    const result = cloneEnv(source, target, { overwrite: false });
    const summary = formatCloneSummary(result);
    expect(summary).toContain('Cloned:');
    expect(summary).toContain('Skipped');
    expect(summary).toContain('APP_NAME');
  });

  it('reports excluded keys', () => {
    const result = cloneEnv(source, {}, { exclude: ['APP_SECRET'] });
    const summary = formatCloneSummary(result);
    expect(summary).toContain('Excluded: 1');
  });
});
