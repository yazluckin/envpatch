import { EnvMap } from "./parser";

export interface NormalizeOptions {
  /** Convert all keys to UPPER_SNAKE_CASE */
  uppercaseKeys?: boolean;
  /** Trim whitespace from values */
  trimValues?: boolean;
  /** Remove empty-value entries */
  removeEmpty?: boolean;
  /** Collapse duplicate whitespace in values */
  collapseWhitespace?: boolean;
}

export interface NormalizeResult {
  normalized: EnvMap;
  changes: NormalizeChange[];
}

export interface NormalizeChange {
  key: string;
  type: "key_renamed" | "value_trimmed" | "value_collapsed" | "removed_empty";
  before: string;
  after: string;
}

export function normalizeEnv(
  env: EnvMap,
  options: NormalizeOptions = {}
): NormalizeResult {
  const {
    uppercaseKeys = true,
    trimValues = true,
    removeEmpty = false,
    collapseWhitespace = false,
  } = options;

  const normalized: EnvMap = {};
  const changes: NormalizeChange[] = [];

  for (const [rawKey, rawValue] of Object.entries(env)) {
    let key = rawKey;
    let value = rawValue;

    if (uppercaseKeys) {
      const upper = rawKey.toUpperCase();
      if (upper !== rawKey) {
        changes.push({ key: rawKey, type: "key_renamed", before: rawKey, after: upper });
        key = upper;
      }
    }

    if (trimValues) {
      const trimmed = value.trim();
      if (trimmed !== value) {
        changes.push({ key, type: "value_trimmed", before: value, after: trimmed });
        value = trimmed;
      }
    }

    if (collapseWhitespace) {
      const collapsed = value.replace(/\s+/g, " ");
      if (collapsed !== value) {
        changes.push({ key, type: "value_collapsed", before: value, after: collapsed });
        value = collapsed;
      }
    }

    if (removeEmpty && value === "") {
      changes.push({ key, type: "removed_empty", before: value, after: "" });
      continue;
    }

    normalized[key] = value;
  }

  return { normalized, changes };
}

export function formatNormalizeSummary(result: NormalizeResult): string {
  if (result.changes.length === 0) return "No normalization changes.";
  const lines = [`Normalization: ${result.changes.length} change(s)`];
  for (const c of result.changes) {
    if (c.type === "key_renamed") lines.push(`  ~ renamed key: ${c.before} → ${c.after}`);
    else if (c.type === "value_trimmed") lines.push(`  ~ trimmed value for: ${c.key}`);
    else if (c.type === "value_collapsed") lines.push(`  ~ collapsed whitespace for: ${c.key}`);
    else if (c.type === "removed_empty") lines.push(`  - removed empty key: ${c.key}`);
  }
  return lines.join("\n");
}
