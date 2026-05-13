import * as fs from "fs";
import { parseEnv, serializeEnv } from "./parser";
import { applyDefaults, formatDefaultsSummary, DefaultsResult } from "./defaults";

/**
 * Read a source .env file and a defaults .env file, apply defaults,
 * and optionally write the result back to the source path.
 */
export function applyDefaultsToFile(
  sourcePath: string,
  defaultsPath: string,
  options: { write?: boolean; overwriteEmpty?: boolean } = {}
): DefaultsResult {
  const sourceContent = fs.readFileSync(sourcePath, "utf-8");
  const defaultsContent = fs.readFileSync(defaultsPath, "utf-8");

  const source = parseEnv(sourceContent);
  const defaults = parseEnv(defaultsContent);

  const result = applyDefaults(source, defaults, options.overwriteEmpty ?? true);

  if (options.write) {
    fs.writeFileSync(sourcePath, serializeEnv(result.output), "utf-8");
  }

  return result;
}

export function applyDefaultsToFileAndReport(
  sourcePath: string,
  defaultsPath: string,
  options: { write?: boolean; overwriteEmpty?: boolean } = {}
): void {
  const result = applyDefaultsToFile(sourcePath, defaultsPath, options);
  console.log(formatDefaultsSummary(result));
}
