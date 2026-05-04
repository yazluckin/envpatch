/**
 * Utilities for masking sensitive values in .env files
 * to prevent accidental secret exposure in logs or diffs.
 */

export type MaskOptions = {
  /** Number of characters to reveal at the start of the value */
  revealPrefix?: number;
  /** Character used to replace hidden characters */
  maskChar?: string;
  /** Minimum masked length (padding short values) */
  minMaskedLength?: number;
};

const SENSITIVE_KEY_PATTERNS = [
  /secret/i,
  /password/i,
  /passwd/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
  /cert/i,
  /passphrase/i,
];

/**
 * Determines whether a given key name is considered sensitive.
 */
export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

/**
 * Masks a single value string according to the provided options.
 */
export function maskValue(
  value: string,
  options: MaskOptions = {}
): string {
  const { revealPrefix = 0, maskChar = '*', minMaskedLength = 6 } = options;

  if (value.length === 0) return '';

  const prefix = value.slice(0, revealPrefix);
  const maskedLength = Math.max(value.length - revealPrefix, minMaskedLength);
  return prefix + maskChar.repeat(maskedLength);
}

/**
 * Masks all sensitive values in a parsed env record.
 * Non-sensitive keys are left unchanged.
 */
export function maskEnv(
  env: Record<string, string>,
  options: MaskOptions = {}
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(env)) {
    result[key] = isSensitiveKey(key) ? maskValue(value, options) : value;
  }

  return result;
}
