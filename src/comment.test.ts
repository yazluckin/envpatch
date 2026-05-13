import { parseComments, applyComments, diffComments, formatCommentSummary } from './comment';

const rawEnv = [
  'DB_HOST=localhost # database host',
  'DB_PORT=5432',
  'API_KEY=secret # keep private',
].join('\n');

describe('parseComments', () => {
  it('extracts inline comments', () => {
    const comments = parseComments(rawEnv);
    expect(comments['DB_HOST']).toBe('database host');
    expect(comments['API_KEY']).toBe('keep private');
    expect(comments['DB_PORT']).toBeUndefined();
  });

  it('ignores full-line comments', () => {
    const raw = '# this is a comment\nFOO=bar';
    const comments = parseComments(raw);
    expect(Object.keys(comments)).toHaveLength(0);
  });

  it('returns empty object for empty input', () => {
    expect(parseComments('')).toEqual({});
  });
});

describe('applyComments', () => {
  it('appends inline comments to env keys', () => {
    const env = { DB_HOST: 'localhost', DB_PORT: '5432' };
    const comments = { DB_HOST: 'database host' };
    const output = applyComments(env, comments);
    expect(output).toContain('DB_HOST=localhost # database host');
    expect(output).toContain('DB_PORT=5432');
    expect(output).not.toContain('DB_PORT=5432 #');
  });

  it('handles env with no comments', () => {
    const env = { FOO: 'bar' };
    const output = applyComments(env, {});
    expect(output).toBe('FOO=bar');
  });
});

describe('diffComments', () => {
  it('detects added comments', () => {
    const before = {};
    const after = { FOO: 'new comment' };
    const { added } = diffComments(before, after);
    expect(added).toHaveLength(1);
    expect(added[0].key).toBe('FOO');
  });

  it('detects removed comments', () => {
    const before = { FOO: 'old comment' };
    const after = {};
    const { removed } = diffComments(before, after);
    expect(removed).toHaveLength(1);
    expect(removed[0].key).toBe('FOO');
  });

  it('detects updated comments', () => {
    const before = { FOO: 'old' };
    const after = { FOO: 'new' };
    const { updated } = diffComments(before, after);
    expect(updated).toHaveLength(1);
    expect(updated[0].comment).toBe('new');
  });

  it('returns empty arrays when no changes', () => {
    const before = { FOO: 'same' };
    const after = { FOO: 'same' };
    const result = diffComments(before, after);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.updated).toHaveLength(0);
  });
});

describe('formatCommentSummary', () => {
  it('summarizes changes', () => {
    const result = {
      env: {},
      comments: {},
      added: [{ key: 'FOO', comment: 'foo comment' }],
      removed: [],
      updated: [],
    };
    const summary = formatCommentSummary(result);
    expect(summary).toContain('Added comments: FOO');
  });

  it('returns no-change message when empty', () => {
    const result = { env: {}, comments: {}, added: [], removed: [], updated: [] };
    expect(formatCommentSummary(result)).toBe('No comment changes.');
  });
});
