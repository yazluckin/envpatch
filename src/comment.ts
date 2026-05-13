import { CommentEntry, CommentResult } from './comment.types';

/**
 * Parse inline comments from raw .env content.
 * Supports: KEY=value # comment
 */
export function parseComments(raw: string): Record<string, string> {
  const comments: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const rest = trimmed.slice(eqIdx + 1);
    const hashIdx = rest.indexOf(' #');
    if (hashIdx !== -1) {
      comments[key] = rest.slice(hashIdx + 2).trim();
    }
  }
  return comments;
}

/**
 * Apply comments to an env record, returning serialized .env content with inline comments.
 */
export function applyComments(
  env: Record<string, string>,
  comments: Record<string, string>
): string {
  return Object.entries(env)
    .map(([key, value]) => {
      const comment = comments[key];
      return comment ? `${key}=${value} # ${comment}` : `${key}=${value}`;
    })
    .join('\n');
}

/**
 * Diff two comment maps, returning added/removed/updated entries.
 */
export function diffComments(
  before: Record<string, string>,
  after: Record<string, string>
): { added: CommentEntry[]; removed: CommentEntry[]; updated: CommentEntry[] } {
  const added: CommentEntry[] = [];
  const removed: CommentEntry[] = [];
  const updated: CommentEntry[] = [];

  for (const [key, comment] of Object.entries(after)) {
    if (!(key in before)) {
      added.push({ key, comment });
    } else if (before[key] !== comment) {
      updated.push({ key, comment });
    }
  }

  for (const key of Object.keys(before)) {
    if (!(key in after)) {
      removed.push({ key, comment: before[key] });
    }
  }

  return { added, removed, updated };
}

export function formatCommentSummary(result: CommentResult): string {
  const lines: string[] = [];
  if (result.added.length)
    lines.push(`Added comments: ${result.added.map((e) => e.key).join(', ')}`);
  if (result.removed.length)
    lines.push(`Removed comments: ${result.removed.map((e) => e.key).join(', ')}`);
  if (result.updated.length)
    lines.push(`Updated comments: ${result.updated.map((e) => e.key).join(', ')}`);
  if (!lines.length) lines.push('No comment changes.');
  return lines.join('\n');
}
