import { mergeEnv, formatMergeSummary } from './merge';
import { DiffResult } from './diff';

describe('mergeEnv', () => {
  const base = { APP_NAME: 'myapp', PORT: '3000', SECRET: 'old' };

  it('applies added keys from diff', () => {
    const diff: DiffResult = {
      NEW_KEY: { type: 'added', next: 'value1' },
    };
    const { merged, added } = mergeEnv(base, diff);
    expect(merged.NEW_KEY).toBe('value1');
    expect(added).toContain('NEW_KEY');
  });

  it('removes keys marked as removed in diff', () => {
    const diff: DiffResult = {
      PORT: { type: 'removed', prev: '3000' },
    };
    const { merged } = mergeEnv(base, diff);
    expect(merged.PORT).toBeUndefined();
  });

  it('applies changed keys with theirs strategy', () => {
    const diff: DiffResult = {
      SECRET: { type: 'changed', prev: 'old', next: 'new' },
    };
    const { merged, overwritten } = mergeEnv(base, diff, { strategy: 'theirs' });
    expect(merged.SECRET).toBe('new');
    expect(overwritten).toContain('SECRET');
  });

  it('keeps existing value with ours strategy on conflict', () => {
    const diff: DiffResult = {
      APP_NAME: { type: 'added', next: 'other' },
    };
    const { merged, conflicts } = mergeEnv(base, diff, { strategy: 'ours' });
    expect(merged.APP_NAME).toBe('myapp');
    expect(conflicts).toContain('APP_NAME');
  });

  it('overwrites existing key when overwriteExisting is true', () => {
    const diff: DiffResult = {
      APP_NAME: { type: 'added', next: 'newapp' },
    };
    const { merged, added } = mergeEnv(base, diff, { overwriteExisting: true });
    expect(merged.APP_NAME).toBe('newapp');
    expect(added).toContain('APP_NAME');
  });

  it('does not mutate the base object', () => {
    const diff: DiffResult = {
      PORT: { type: 'changed', prev: '3000', next: '8080' },
    };
    mergeEnv(base, diff);
    expect(base.PORT).toBe('3000');
  });
});

describe('formatMergeSummary', () => {
  it('returns no changes message when nothing changed', () => {
    const summary = formatMergeSummary({ merged: {}, conflicts: [], added: [], overwritten: [] });
    expect(summary).toBe('No changes applied.');
  });

  it('lists added keys', () => {
    const summary = formatMergeSummary({ merged: {}, conflicts: [], added: ['FOO', 'BAR'], overwritten: [] });
    expect(summary).toContain('Added: FOO, BAR');
  });

  it('lists conflicts and overwritten keys', () => {
    const summary = formatMergeSummary({ merged: {}, conflicts: ['SECRET'], added: [], overwritten: ['SECRET'] });
    expect(summary).toContain('Conflicts resolved: SECRET');
    expect(summary).toContain('Overwritten: SECRET');
  });
});
