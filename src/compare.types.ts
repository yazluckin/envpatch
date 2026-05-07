export interface CompareOptions {
  /** Keys to ignore during comparison */
  ignoreKeys?: string[];
  /** Whether to mask sensitive values in output */
  maskSecrets?: boolean;
  /** Whether to treat missing keys as empty string (vs. missing) */
  treatMissingAsEmpty?: boolean;
}

export type CompareStatus = 'match' | 'mismatch' | 'missing_left' | 'missing_right';

export interface CompareEntry {
  key: string;
  status: CompareStatus;
  leftValue?: string;
  rightValue?: string;
}

export interface CompareResult {
  entries: CompareEntry[];
  totalKeys: number;
  matchCount: number;
  mismatchCount: number;
  missingLeftCount: number;
  missingRightCount: number;
  isIdentical: boolean;
}
