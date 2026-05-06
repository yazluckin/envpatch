import { readFileSync, writeFileSync } from "fs";
import { parseEnv, serializeEnv } from "./parser.js";
import { redactEnv, formatRedactSummary } from "./redact.js";
import type { RedactOptions, RedactResult } from "./redact.types.js";

/**
 * Read an .env file, redact sensitive values, and write the result to an output file.
 * If outputPath is omitted, the input file is overwritten.
 */
export function redactEnvFile(
  inputPath: string,
  outputPath?: string,
  options: RedactOptions = {}
): RedactResult {
  const raw = readFileSync(inputPath, "utf-8");
  const env = parseEnv(raw);
  const result = redactEnv(env, options);
  const serialized = serializeEnv(result.env);
  writeFileSync(outputPath ?? inputPath, serialized, "utf-8");
  return result;
}

/**
 * Redact an .env file and print a summary to stdout.
 * Returns true if any keys were redacted.
 */
export function redactEnvFileAndReport(
  inputPath: string,
  outputPath?: string,
  options: RedactOptions = {}
): boolean {
  const result = redactEnvFile(inputPath, outputPath, options);
  console.log(formatRedactSummary(result));
  return result.redacted.length > 0;
}
