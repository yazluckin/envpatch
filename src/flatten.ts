import { parseEnv, serializeEnv } from "./parser";

export interface FlattenOptions {
  prefix?: string;
  separator?: string;
  uppercase?: boolean;
}

export interface FlattenResult {
  original: Record<string, string>;
  flattened: Record<string, string>;
  renamedKeys: Array<{ from: string; to: string }>;
}

/**
 * Flatten nested-style env keys (e.g. APP__DB__HOST) into a single level,
 * optionally applying a prefix, separator, and case normalization.
 */
export function flattenEnv(
  env: Record<string, string>,
  options: FlattenOptions = {}
): FlattenResult {
  const { prefix = "", separator = "_", uppercase = false } = options;
  const flattened: Record<string, string> = {};
  const renamedKeys: Array<{ from: string; to: string }> = [];

  for (const [key, value] of Object.entries(env)) {
    let newKey = key;

    if (uppercase) {
      newKey = newKey.toUpperCase();
    }

    if (prefix) {
      const sep = separator;
      if (!newKey.startsWith(prefix + sep)) {
        newKey = `${prefix}${sep}${newKey}`;
      }
    }

    if (newKey !== key) {
      renamedKeys.push({ from: key, to: newKey });
    }

    flattened[newKey] = value;
  }

  return {
    original: env,
    flattened,
    renamedKeys,
  };
}

export function formatFlattenSummary(result: FlattenResult): string {
  const lines: string[] = [];
  const total = Object.keys(result.flattened).length;
  const renamed = result.renamedKeys.length;
  const unchanged = total - renamed;

  lines.push(`Flatten summary: ${total} key(s) total`);
  lines.push(`  Unchanged : ${unchanged}`);
  lines.push(`  Renamed   : ${renamed}`);

  for (const { from, to } of result.renamedKeys) {
    lines.push(`    ${from} → ${to}`);
  }

  return lines.join("\n");
}
