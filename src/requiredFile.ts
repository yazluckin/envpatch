import { readFileSync } from "fs";
import { parseEnv } from "./parser";
import {
  checkRequired,
  allRequiredPresent,
  formatRequiredSummary,
  RequiredResult,
} from "./required";

/**
 * Check required keys against an env file on disk.
 */
export function checkRequiredInFile(
  filePath: string,
  requiredKeys: string[]
): RequiredResult {
  const raw = readFileSync(filePath, "utf-8");
  const env = parseEnv(raw);
  return checkRequired(env, requiredKeys);
}

/**
 * Check required keys and print a report. Returns true if all present.
 */
export function checkRequiredInFileAndReport(
  filePath: string,
  requiredKeys: string[]
): boolean {
  const result = checkRequiredInFile(filePath, requiredKeys);
  const summary = formatRequiredSummary(result);
  console.log(summary);
  return result.missing.length === 0;
}

export { allRequiredPresent };
