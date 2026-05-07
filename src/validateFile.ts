import * as fs from "fs";
import { parseEnv } from "./parser";
import { validateEnv, formatValidationSummary, EnvSchema, ValidationResult } from "./validate";

/**
 * Reads and parses an .env file, then validates it against the provided schema.
 * Throws if the file cannot be read or does not exist.
 */
export function validateEnvFile(
  filePath: string,
  schema: EnvSchema
): ValidationResult {
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to read env file "${filePath}": ${message}`);
  }
  const env = parseEnv(raw);
  return validateEnv(env, schema);
}

/**
 * Reads and validates an .env file, printing a formatted summary to stdout.
 * Returns the ValidationResult for programmatic use.
 */
export function validateEnvFileAndReport(
  filePath: string,
  schema: EnvSchema
): ValidationResult {
  const result = validateEnvFile(filePath, schema);
  const summary = formatValidationSummary(result);
  console.log(`Validating: ${filePath}`);
  console.log(summary);
  return result;
}
