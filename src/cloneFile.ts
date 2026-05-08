import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from './parser';
import { cloneEnv, applyClone, formatCloneSummary, CloneOptions, CloneResult } from './clone';

export function cloneEnvFile(
  sourcePath: string,
  targetPath: string,
  options: CloneOptions = {}
): CloneResult {
  const sourceContent = readFileSync(sourcePath, 'utf-8');
  const targetContent = (() => {
    try {
      return readFileSync(targetPath, 'utf-8');
    } catch {
      return '';
    }
  })();

  const source = parseEnv(sourceContent);
  const target = parseEnv(targetContent);

  const result = cloneEnv(source, target, options);
  const merged = applyClone(target, result);

  writeFileSync(targetPath, serializeEnv(merged), 'utf-8');

  return result;
}

export function cloneEnvFileAndReport(
  sourcePath: string,
  targetPath: string,
  options: CloneOptions = {}
): string {
  const result = cloneEnvFile(sourcePath, targetPath, options);
  return formatCloneSummary(result);
}
