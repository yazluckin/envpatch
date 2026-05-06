export type SyncDirection = 'left' | 'right' | 'both';

export interface SyncOptions {
  direction?: SyncDirection;
  overwrite?: boolean;
  skipSensitive?: boolean;
  dryRun?: boolean;
}

export interface SyncChange {
  key: string;
  direction: 'left' | 'right';
  fromValue: string | undefined;
  toValue: string | undefined;
  action: 'add' | 'update' | 'skip';
}

export interface SyncResult {
  changes: SyncChange[];
  leftEnv: Record<string, string>;
  rightEnv: Record<string, string>;
  skipped: string[];
}
