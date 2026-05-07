import { describe, it, expect } from 'vitest';
import { renameEnv, formatRenameSummary } from './rename';

describe('renameEnv', () => {
  const base = { OLD_KEY: 'value1', KEEP: 'value2', CONFLICT: 'exists' };

  it('renames a key successfully', () => {
    const result = renameEnv(base, [{ from: 'OLD_KEY', to: 'NEW_KEY' }]);
    expect(result.output).toHaveProperty('NEW_KEY', 'value1');
    expect(result.output).not.toHaveProperty('OLD_KEY');
    expect(result.renamed).toHaveLength(1);
    expect(result.renamed[0]).toEqual({ from: 'OLD_KEY', to: 'NEW_KEY' });
  });

  it('tracks keys not found in env', () => {
    const result = renameEnv(base, [{ from: 'MISSING', to: 'SOMETHING' }]);
    expect(result.notFound).toContain('MISSING');
    expect(result.renamed).toHaveLength(0);
  });

  it('tracks conflict when target key already exists', () => {
    const result = renameEnv(base, [{ from: 'OLD_KEY', to: 'CONFLICT' }]);
    expect(result.conflicts).toContain('CONFLICT');
    expect(result.output).toHaveProperty('OLD_KEY');
    expect(result.renamed).toHaveLength(0);
  });

  it('allows renaming a key to itself (no-op)', () => {
    const result = renameEnv(base, [{ from: 'KEEP', to: 'KEEP' }]);
    expect(result.renamed).toHaveLength(1);
    expect(result.output).toHaveProperty('KEEP', 'value2');
    expect(result.conflicts).toHaveLength(0);
  });

  it('applies multiple rules in sequence', () => {
    const result = renameEnv(base, [
      { from: 'OLD_KEY', to: 'NEW_KEY' },
      { from: 'KEEP', to: 'RETAINED' },
    ]);
    expect(result.renamed).toHaveLength(2);
    expect(result.output).toHaveProperty('NEW_KEY');
    expect(result.output).toHaveProperty('RETAINED');
    expect(result.output).not.toHaveProperty('OLD_KEY');
    expect(result.output).not.toHaveProperty('KEEP');
  });

  it('does not mutate the original env', () => {
    const original = { A: '1', B: '2' };
    renameEnv(original, [{ from: 'A', to: 'Z' }]);
    expect(original).toHaveProperty('A');
  });
});

describe('formatRenameSummary', () => {
  it('formats a full result with all categories', () => {
    const result = {
      renamed: [{ from: 'OLD', to: 'NEW' }],
      notFound: ['GHOST'],
      conflicts: ['TAKEN'],
      output: {},
    };
    const summary = formatRenameSummary(result);
    expect(summary).toContain('OLD → NEW');
    expect(summary).toContain('GHOST');
    expect(summary).toContain('TAKEN');
  });

  it('returns a no-op message when nothing happened', () => {
    const result = { renamed: [], notFound: [], conflicts: [], output: {} };
    expect(formatRenameSummary(result)).toContain('No rename rules applied.');
  });
});
