/**
 * Validates an env object against a schema (a set of required and optional keys).
 */

export interface EnvSchema {
  required?: string[];
  optional?: string[];
}

export interface ValidationResult {
  valid: boolean;
  missing: string[];
  unknown: string[];
  warnings: string[];
}

/**
 * Validates that all required keys are present in the env object.
 * Optionally warns about keys not listed in required or optional.
 */
export function validateEnv(
  env: Record<string, string>,
  schema: EnvSchema
): ValidationResult {
  const required = schema.required ?? [];
  const optional = schema.optional ?? [];
  const known = new Set([...required, ...optional]);
  const envKeys = Object.keys(env);

  const missing = required.filter((key) => !(key in env) || env[key].trim() === "");

  const unknown =
    known.size > 0 ? envKeys.filter((key) => !known.has(key)) : [];

  const warnings: string[] = [
    ...unknown.map((key) => `Unknown key: ${key}`),
    ...required
      .filter((key) => key in env && env[key].trim() === "")
      .map((key) => `Required key is empty: ${key}`),
  ];

  return {
    valid: missing.length === 0,
    missing,
    unknown,
    warnings,
  };
}

/**
 * Formats a ValidationResult into a human-readable summary string.
 */
export function formatValidationSummary(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.valid) {
    lines.push("✔ Validation passed.");
  } else {
    lines.push("✘ Validation failed.");
  }

  if (result.missing.length > 0) {
    lines.push(`  Missing required keys (${result.missing.length}):`);
    result.missing.forEach((k) => lines.push(`    - ${k}`));
  }

  if (result.warnings.length > 0) {
    lines.push(`  Warnings (${result.warnings.length}):`);
    result.warnings.forEach((w) => lines.push(`    ! ${w}`));
  }

  return lines.join("\n");
}
