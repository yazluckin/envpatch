import * as fs from 'fs';
import { parseEnv, serializeEnv } from './parser';
import { diffEnv } from './diff';
import { applyPatch, PatchOptions, PatchResult } from './patch';

export interface PatchFileOptions extends PatchOptions {
  outputPath?: string;
}

/**
 * Reads two .env files, diffs them, and applies the patch.
 * Writes the result to outputPath or overwrites the base file.
 */
export function patchEnvFile(
  basePath: string,
  patchPath: string,
  options: PatchFileOptions = {}
): PatchResult {
  if (!fs.existsSync(basePath)) {
    throw new Error(`Base file not found: ${basePath}`);
  }
  if (!fs.existsSync(patchPath)) {
    throw new Error(`Patch file not found: ${patchPath}`);
  }

  const baseContent = fs.readFileSync(basePath, 'utf-8');
  const patchContent = fs.readFileSync(patchPath, 'utf-8');

  const baseEnv = parseEnv(baseContent);
  const patchEnv = parseEnv(patchContent);

  const diff = diffEnv(baseEnv, patchEnv);
  const result = applyPatch(baseEnv, diff, options);

  if (!options.dryRun) {
    const dest = options.outputPath ?? basePath;
    fs.writeFileSync(dest, serializeEnv(result.patched), 'utf-8');
  }

  return result;
}
