import { isSensitiveKey } from "./mask.js";
import type { RedactOptions, RedactResult } from "./redact.types.js";

const DEFAULT_PLACEHOLDER = "[REDACTED]";

/**
 * Redact sensitive values in an env record.
 * Unlike maskValue (which partially obscures), redactValue fully replaces the value.
 */
export function redactValue(placeholder: string = DEFAULT_PLACEHOLDER): string {
  return placeholder;
}

/**
 * Redact an env record based on explicit keys and/or auto-detection.
 */
export function redactEnv(
  env: Record<string, string>,
  options: RedactOptions = {}
): RedactResult {
  const {
    keys = [],
    placeholder = DEFAULT_PLACEHOLDER,
    autoDetect = true,
  } = options;

  const explicitKeys = new Set(keys.map((k) => k.toUpperCase()));

  const redacted: string[] = [];
  const unchanged: string[] = [];
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(env)) {
    const upperKey = key.toUpperCase();
    const shouldRedact =
      explicitKeys.has(upperKey) || (autoDetect && isSensitiveKey(key));

    if (shouldRedact) {
      result[key] = placeholder;
      redacted.push(key);
    } else {
      result[key] = value;
      unchanged.push(key);
    }
  }

  return { env: result, redacted, unchanged };
}

/**
 * Format a human-readable summary of a redact operation.
 */
export function formatRedactSummary(result: RedactResult): string {
  const lines: string[] = [];

  if (result.redacted.length === 0) {
    lines.push("No keys were redacted.");
    return lines.join("\n");
  }

  lines.push(`Redacted ${result.redacted.length} key(s):`);
  for (const key of result.redacted) {
    lines.push(`  - ${key}`);
  }

  if (result.unchanged.length > 0) {
    lines.push(`Unchanged: ${result.unchanged.length} key(s)`);
  }

  return lines.join("\n");
}
