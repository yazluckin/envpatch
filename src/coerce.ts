import { EnvMap } from "./parser";

export type CoerceType = "string" | "number" | "boolean" | "json";

export interface CoerceRule {
  key: string;
  type: CoerceType;
}

export interface CoerceResult {
  coerced: Record<string, unknown>;
  skipped: string[];
  errors: Array<{ key: string; reason: string }>;
}

function coerceValue(value: string, type: CoerceType): unknown {
  switch (type) {
    case "string":
      return value;
    case "number": {
      const n = Number(value);
      if (isNaN(n)) throw new Error(`Cannot coerce "${value}" to number`);
      return n;
    }
    case "boolean": {
      const lower = value.toLowerCase();
      if (["true", "1", "yes", "on"].includes(lower)) return true;
      if (["false", "0", "no", "off"].includes(lower)) return false;
      throw new Error(`Cannot coerce "${value}" to boolean`);
    }
    case "json": {
      try {
        return JSON.parse(value);
      } catch {
        throw new Error(`Cannot coerce "${value}" to JSON`);
      }
    }
  }
}

export function coerceEnv(env: EnvMap, rules: CoerceRule[]): CoerceResult {
  const coerced: Record<string, unknown> = {};
  const skipped: string[] = [];
  const errors: Array<{ key: string; reason: string }> = [];

  for (const { key, type } of rules) {
    if (!(key in env)) {
      skipped.push(key);
      continue;
    }
    try {
      coerced[key] = coerceValue(env[key], type);
    } catch (err) {
      errors.push({ key, reason: (err as Error).message });
    }
  }

  return { coerced, skipped, errors };
}

export function formatCoerceSummary(result: CoerceResult): string {
  const lines: string[] = [];
  const total = Object.keys(result.coerced).length;

  lines.push(`Coerced: ${total} key(s)`);

  if (result.skipped.length > 0) {
    lines.push(`Skipped (missing): ${result.skipped.join(", ")}`);
  }

  if (result.errors.length > 0) {
    lines.push("Errors:");
    for (const { key, reason } of result.errors) {
      lines.push(`  ${key}: ${reason}`);
    }
  }

  return lines.join("\n");
}
