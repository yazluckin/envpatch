import { sortEnv, formatSortSummary } from './sort';
import { EnvMap } from './parser';

const unsorted: EnvMap = {
  ZEBRA: 'z',
  APPLE: 'a',
  MANGO: 'm',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  APP_NAME: 'test',
  APP_ENV: 'dev',
};

describe('sortEnv', () => {
  it('sorts keys ascending by default', () => {
    const result = sortEnv(unsorted);
    const keys = Object.keys(result.sorted);
    expect(keys).toEqual([...keys].sort());
  });

  it('sorts keys descending when order is desc', () => {
    const result = sortEnv(unsorted, { order: 'desc' });
    const keys = Object.keys(result.sorted);
    expect(keys).toEqual([...keys].sort((a, b) => b.localeCompare(a)));
  });

  it('marks changed as true when order differs', () => {
    const result = sortEnv(unsorted);
    expect(result.changed).toBe(true);
  });

  it('marks changed as false when already sorted', () => {
    const sorted: EnvMap = { APPLE: 'a', MANGO: 'm', ZEBRA: 'z' };
    const result = sortEnv(sorted);
    expect(result.changed).toBe(false);
  });

  it('groups by prefix when groupByPrefix is true', () => {
    const result = sortEnv(unsorted, { groupByPrefix: true });
    const keys = Object.keys(result.sorted);
    const appIdx = keys.findIndex((k) => k.startsWith('APP_'));
    const dbIdx = keys.findIndex((k) => k.startsWith('DB_'));
    const appleIdx = keys.indexOf('APPLE');
    // APP_ group should come before DB_ group
    expect(appIdx).toBeLessThan(dbIdx);
    // Ungrouped keys without underscore come last or first depending on sort
    expect(appleIdx).toBeGreaterThanOrEqual(0);
  });

  it('preserves all keys and values after sort', () => {
    const result = sortEnv(unsorted);
    expect(Object.keys(result.sorted).length).toBe(Object.keys(unsorted).length);
    for (const key of Object.keys(unsorted)) {
      expect(result.sorted[key]).toBe(unsorted[key]);
    }
  });

  it('returns original env unchanged', () => {
    const result = sortEnv(unsorted);
    expect(result.original).toBe(unsorted);
  });
});

describe('formatSortSummary', () => {
  it('reports no changes when already sorted', () => {
    const sorted: EnvMap = { A: '1', B: '2' };
    const result = sortEnv(sorted);
    expect(formatSortSummary(result)).toMatch(/already in sorted order/);
  });

  it('reports count of sorted keys', () => {
    const result = sortEnv(unsorted);
    expect(formatSortSummary(result)).toMatch(/Sorted 7 keys/);
  });

  it('uses singular for one key', () => {
    const result = sortEnv({ A: '1' });
    result.changed = true;
    expect(formatSortSummary(result)).toMatch(/Sorted 1 key\./);
  });
});
