import { EnvMap } from "./parser";

export interface DedupResult {
  deduped: EnvMap;
  duplicates: Record<string, string[]>;
}

export interface DedupOptions {
  /** Which occurrence to keep: 'first' | 'last'. Defaults to 'last' */
  keep?: "first" | "last";
}

/**
 * Detects and removes duplicate keys from a parsed .env map (preserving insertion order).
 * When parsing raw .env content, duplicate keys may appear; this utility resolves them.
 */
export function dedupEnv(
  entries: Array<[string, string]>,
  options: DedupOptions = {}
): DedupResult {
  const { keep = "last" } = options;
  const seen = new Map<string, string[]>();

  for (const [key, value] of entries) {
    if (!seen.has(key)) {
      seen.set(key, []);
    }
    seen.get(key)!.push(value);
  }

  const duplicates: Record<string, string[]> = {};
  const deduped: EnvMap = {};

  for (const [key, values] of seen.entries()) {
    if (values.length > 1) {
      duplicates[key] = values;
    }
    deduped[key] = keep === "first" ? values[0] : values[values.length - 1];
  }

  return { deduped, duplicates };
}

export function formatDedupSummary(result: DedupResult): string {
  const dupKeys = Object.keys(result.duplicates);
  if (dupKeys.length === 0) {
    return "No duplicate keys found.";
  }

  const lines: string[] = [`Found ${dupKeys.length} duplicate key(s):`, ""];
  for (const key of dupKeys) {
    const values = result.duplicates[key];
    lines.push(`  ${key} (${values.length} occurrences)`);
    values.forEach((v, i) => {
      const label = i === values.length - 1 ? "kept" : "discarded";
      lines.push(`    [${i + 1}] ${v === "" ? "(empty)" : v}  → ${label}`);
    });
  }

  return lines.join("\n");
}
