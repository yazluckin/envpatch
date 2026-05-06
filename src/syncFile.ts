import * as fs from 'fs';
import { parseEnv, serializeEnv } from './parser';
import { syncEnv, formatSyncSummary } from './sync';
import { SyncOptions, SyncResult } from './sync.types';

export interface SyncFileResult {
  result: SyncResult;
  summary: string;
}

export function syncEnvFiles(
  leftPath: string,
  rightPath: string,
  options: SyncOptions = {}
): SyncFileResult {
  const leftContent = fs.existsSync(leftPath) ? fs.readFileSync(leftPath, 'utf-8') : '';
  const rightContent = fs.existsSync(rightPath) ? fs.readFileSync(rightPath, 'utf-8') : '';

  const left = parseEnv(leftContent);
  const right = parseEnv(rightContent);

  const result = syncEnv(left, right, options);
  const summary = formatSyncSummary(result);

  if (!options.dryRun) {
    if (options.direction !== 'right') {
      fs.writeFileSync(leftPath, serializeEnv(result.leftEnv), 'utf-8');
    }
    if (options.direction !== 'left') {
      fs.writeFileSync(rightPath, serializeEnv(result.rightEnv), 'utf-8');
    }
  }

  return { result, summary };
}

export function syncEnvFileAndReport(
  leftPath: string,
  rightPath: string,
  options: SyncOptions = {}
): void {
  const { summary } = syncEnvFiles(leftPath, rightPath, options);
  console.log(summary);
}
