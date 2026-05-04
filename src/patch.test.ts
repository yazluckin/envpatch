import { applyPatch, formatPatchSummary } from './patch';
import { DiffResult } from './diff';

const baseDiff = (): DiffResult => ({
  added: ['NEW_KEY'],
  removed: ['OLD_KEY'],
  changed: ['CHANGED_KEY'],
  unchanged: ['SAME_KEY'],
  source: { OLD_KEY: 'old', CHANGED_KEY: 'before', SAME_KEY: 'same' },
  target: { NEW_KEY: 'new', CHANGED_KEY: 'after', SAME_KEY: 'same' },
});

const base = { OLD_KEY: 'old', CHANGED_KEY: 'before', SAME_KEY: 'same' };

describe('applyPatch', () => {
  it('adds new keys by default', () => {
    const { patched, applied } = applyPatch(base, baseDiff());
    expect(patched['NEW_KEY']).toBe('new');
    expect(applied).toContain('NEW_KEY');
  });

  it('does not overwrite changed keys by default', () => {
    const { patched, skipped } = applyPatch(base, baseDiff());
    expect(patched['CHANGED_KEY']).toBe('before');
    expect(skipped).toContain('CHANGED_KEY');
  });

  it('does not remove keys by default', () => {
    const { patched, skipped } = applyPatch(base, baseDiff());
    expect(patched['OLD_KEY']).toBe('old');
    expect(skipped).toContain('OLD_KEY');
  });

  it('overwrites changed keys when overwrite=true', () => {
    const { patched, applied } = applyPatch(base, baseDiff(), { overwrite: true });
    expect(patched['CHANGED_KEY']).toBe('after');
    expect(applied).toContain('CHANGED_KEY');
  });

  it('removes keys when overwrite=true', () => {
    const { patched, applied } = applyPatch(base, baseDiff(), { overwrite: true });
    expect(patched['OLD_KEY']).toBeUndefined();
    expect(applied).toContain('OLD_KEY');
  });

  it('does not mutate base env in dryRun mode', () => {
    const { patched } = applyPatch(base, baseDiff(), { dryRun: true });
    expect(patched['NEW_KEY']).toBeUndefined();
    expect(base['NEW_KEY' as keyof typeof base]).toBeUndefined();
  });

  it('preserves unchanged keys', () => {
    const { patched } = applyPatch(base, baseDiff());
    expect(patched['SAME_KEY']).toBe('same');
  });
});

describe('formatPatchSummary', () => {
  it('includes applied and skipped counts', () => {
    const result = applyPatch(base, baseDiff());
    const summary = formatPatchSummary(result);
    expect(summary).toMatch(/Applied/);
    expect(summary).toMatch(/Skipped/);
  });

  it('lists skipped keys when present', () => {
    const result = applyPatch(base, baseDiff());
    const summary = formatPatchSummary(result);
    expect(summary).toContain('CHANGED_KEY');
  });
});
