export interface RedactOptions {
  /** Keys whose values should be fully redacted (replaced with placeholder) */
  keys?: string[];
  /** Placeholder string used in place of redacted values */
  placeholder?: string;
  /** If true, use isSensitiveKey heuristic in addition to explicit keys */
  autoDetect?: boolean;
}

export interface RedactResult {
  /** The redacted env record */
  env: Record<string, string>;
  /** Keys that were redacted */
  redacted: string[];
  /** Keys that were left unchanged */
  unchanged: string[];
}
