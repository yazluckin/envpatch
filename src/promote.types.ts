/**
 * Types for the promote feature — promoting env vars from one environment to another.
 */

export interface PromoteEntry {
  /** The previous value in the target (undefined if key is new) */
  from: string | undefined;
  /** The incoming value from the source */
  to: string;
}

export interface PromoteOptions {
  /** If true, overwrite keys that already exist in the target */
  overwrite?: boolean;
  /** If true, compute the result but do not write any files */
  dryRun?: boolean;
  /** Keys to exclude from promotion */
  excludeKeys?: string[];
}

export interface PromoteResult {
  /** Keys successfully promoted, with before/after values */
  promoted: Record<string, PromoteEntry>;
  /** Keys that were skipped and the reason */
  skipped: Record<string, string>;
  /** Keys present in target but absent in source (informational) */
  removed: string[];
}

export interface PromoteFileResult {
  result: PromoteResult;
  summary: string;
  outputPath: string;
}
