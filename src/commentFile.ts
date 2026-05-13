import * as fs from 'fs';
import { parseComments, applyComments, diffComments, formatCommentSummary } from './comment';
import { parseEnv } from './parser';
import { CommentResult } from './comment.types';

export function readCommentsFromFile(filePath: string): Record<string, string> {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return parseComments(raw);
}

export function applyCommentsToFile(
  filePath: string,
  comments: Record<string, string>,
  outputPath?: string
): CommentResult {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const env = parseEnv(raw);
  const existingComments = parseComments(raw);
  const merged = { ...existingComments, ...comments };
  const { added, removed, updated } = diffComments(existingComments, merged);
  const output = applyComments(env, merged);
  fs.writeFileSync(outputPath ?? filePath, output, 'utf-8');
  return { env, comments: merged, added, removed, updated };
}

export function applyCommentsToFileAndReport(
  filePath: string,
  comments: Record<string, string>,
  outputPath?: string
): string {
  const result = applyCommentsToFile(filePath, comments, outputPath);
  return formatCommentSummary(result);
}
