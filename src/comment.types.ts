export interface CommentEntry {
  key: string;
  comment: string;
}

export interface CommentResult {
  env: Record<string, string>;
  comments: Record<string, string>;
  added: CommentEntry[];
  removed: CommentEntry[];
  updated: CommentEntry[];
}
