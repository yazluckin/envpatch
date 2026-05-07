import { EnvMap } from "./parser";

export type TransformFn = (key: string, value: string) => string;

export interface TransformRule {
  match: string | RegExp;
  transform: TransformFn;
}

export interface TransformResult {
  original: EnvMap;
  transformed: EnvMap;
  changes: Array<{ key: string; before: string; after: string }>;
}

/**
 * Apply a series of transform rules to an env map.
 * Rules are applied in order; the first matching rule wins.
 */
export function transformEnv(
  env: EnvMap,
  rules: TransformRule[]
): TransformResult {
  const transformed: EnvMap = {};
  const changes: TransformResult["changes"] = [];

  for (const [key, value] of Object.entries(env)) {
    const rule = rules.find((r) =>
      typeof r.match === "string" ? r.match === key : r.match.test(key)
    );

    if (rule) {
      const after = rule.transform(key, value);
      transformed[key] = after;
      if (after !== value) {
        changes.push({ key, before: value, after });
      }
    } else {
      transformed[key] = value;
    }
  }

  return { original: env, transformed, changes };
}

export function formatTransformSummary(result: TransformResult): string {
  if (result.changes.length === 0) {
    return "No values were transformed.";
  }

  const lines = [`Transformed ${result.changes.length} value(s):`, ""];

  for (const { key, before, after } of result.changes) {
    lines.push(`  ${key}`);
    lines.push(`    before: ${before}`);
    lines.push(`    after:  ${after}`);
  }

  return lines.join("\n");
}
