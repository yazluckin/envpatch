import * as fs from 'fs';
import * as path from 'path';
import { parseEnv, serializeEnv } from './parser';
import { promoteEnv, applyPromote, formatPromoteSummary, PromoteOptions, PromoteResult } from './promote';

export interface PromoteFileResult {
  result: PromoteResult;
  summary: string;
  outputPath: string;
}

/**
 * Promote values from sourceFile into targetFile.
 * Writes updated target to outputPath (defaults to targetFile).
 */
export function promoteEnvFile(
  sourceFile: string,
  targetFile: string,
  outputPath?: string,
  options: PromoteOptions = {}
): PromoteFileResult {
  const sourceRaw = fs.readFileSync(sourceFile, 'utf-8');
  const targetRaw = fs.existsSync(targetFile)
    ? fs.readFileSync(targetFile, 'utf-8')
    : '';

  const source = parseEnv(sourceRaw);
  const target = parseEnv(targetRaw);

  const result = promoteEnv(source, target, options);
  const dest = outputPath ?? targetFile;

  if (!options.dryRun) {
    const updated = applyPromote(target, result);
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dest, serializeEnv(updated), 'utf-8');
  }

  const summary = formatPromoteSummary(result);
  return { result, summary, outputPath: dest };
}

export function promoteEnvFileAndReport(
  sourceFile: string,
  targetFile: string,
  outputPath?: string,
  options: PromoteOptions = {}
): void {
  const { summary } = promoteEnvFile(sourceFile, targetFile, outputPath, options);
  console.log(summary);
}
