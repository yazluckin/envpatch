import * as fs from 'fs';
import { parseEnv, serializeEnv } from './parser';
import { renameEnv, RenameRule, RenameResult, formatRenameSummary } from './rename';

export function renameEnvFile(
  filePath: string,
  rules: RenameRule[],
  outputPath?: string
): RenameResult {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const env = parseEnv(raw);
  const result = renameEnv(env, rules);
  const dest = outputPath ?? filePath;
  fs.writeFileSync(dest, serializeEnv(result.output), 'utf-8');
  return result;
}

export function renameEnvFileAndReport(
  filePath: string,
  rules: RenameRule[],
  outputPath?: string
): void {
  const result = renameEnvFile(filePath, rules, outputPath);
  console.log(formatRenameSummary(result));
  if (result.conflicts.length > 0 || result.notFound.length > 0) {
    process.exitCode = 1;
  }
}
