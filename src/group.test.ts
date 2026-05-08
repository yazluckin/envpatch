import { groupEnv, flattenGroup, formatGroupSummary } from './group';
import { EnvMap } from './parser';

describe('groupEnv', () => {
  const env: EnvMap = {
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_NAME: 'mydb',
    REDIS_HOST: 'localhost',
    REDIS_PORT: '6379',
    APP_NAME: 'envpatch',
    PORT: '3000',
  };

  it('groups variables by prefix', () => {
    const { groups } = groupEnv(env);
    expect(Object.keys(groups).sort()).toEqual(['APP', 'DB', 'REDIS']);
    expect(groups['DB']).toEqual({ HOST: 'localhost', PORT: '5432', NAME: 'mydb' });
    expect(groups['REDIS']).toEqual({ HOST: 'localhost', PORT: '6379' });
    expect(groups['APP']).toEqual({ NAME: 'envpatch' });
  });

  it('places non-prefixed keys in ungrouped', () => {
    const { ungrouped } = groupEnv(env);
    expect(ungrouped).toEqual({ PORT: '3000' });
  });

  it('returns empty groups and ungrouped for empty env', () => {
    const result = groupEnv({});
    expect(result.groups).toEqual({});
    expect(result.ungrouped).toEqual({});
  });

  it('supports custom delimiter', () => {
    const custom: EnvMap = { 'DB.HOST': 'localhost', 'DB.PORT': '5432', STANDALONE: '1' };
    const { groups, ungrouped } = groupEnv(custom, '.');
    expect(groups['DB']).toEqual({ HOST: 'localhost', PORT: '5432' });
    expect(ungrouped).toEqual({ STANDALONE: '1' });
  });
});

describe('flattenGroup', () => {
  it('flattens a group back to prefixed keys', () => {
    const group: EnvMap = { HOST: 'localhost', PORT: '5432' };
    const flat = flattenGroup('DB', group);
    expect(flat).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
  });

  it('supports custom delimiter', () => {
    const group: EnvMap = { HOST: 'localhost' };
    const flat = flattenGroup('DB', group, '.');
    expect(flat).toEqual({ 'DB.HOST': 'localhost' });
  });
});

describe('formatGroupSummary', () => {
  it('formats a summary with groups and ungrouped', () => {
    const result = groupEnv({ DB_HOST: 'x', DB_PORT: '5432', PORT: '3000' });
    const summary = formatGroupSummary(result);
    expect(summary).toContain('[DB] (2 keys)');
    expect(summary).toContain('  DB_HOST');
    expect(summary).toContain('  DB_PORT');
    expect(summary).toContain('[ungrouped] (1 key)');
    expect(summary).toContain('  PORT');
  });

  it('returns a message when env is empty', () => {
    const summary = formatGroupSummary({ groups: {}, ungrouped: {} });
    expect(summary).toBe('No variables found.');
  });

  it('omits ungrouped section when all keys are grouped', () => {
    const result = groupEnv({ DB_HOST: 'x' });
    const summary = formatGroupSummary(result);
    expect(summary).not.toContain('ungrouped');
  });
});
