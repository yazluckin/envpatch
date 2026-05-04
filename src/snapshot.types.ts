/**
 * Represents a point-in-time capture of a masked .env file.
 * Sensitive values are replaced before storage — no secrets are persisted.
 */
export interface Snapshot {
  /** ISO 8601 timestamp of when the snapshot was taken */
  timestamp: string;
  /** Human-readable label for this snapshot (e.g. filename or environment name) */
  label: string;
  /** Masked key-value pairs — sensitive values are redacted */
  maskedEnv: Record<string, string>;
  /** Ordered list of all keys present in the original .env file */
  keys: string[];
}

/**
 * Result of comparing two snapshots side by side.
 */
export interface SnapshotComparison {
  /** Keys present in `after` but not in `before` */
  added: string[];
  /** Keys present in `before` but not in `after` */
  removed: string[];
  /** Keys present in both snapshots */
  unchanged: string[];
}

/**
 * Options for the snapshotEnvFile utility.
 */
export interface SnapshotOptions {
  /** Optional label to identify this snapshot; defaults to the env filename */
  label?: string;
  /** Directory where snapshot JSON files are stored; defaults to ".env-snapshots" */
  snapshotDir?: string;
}
