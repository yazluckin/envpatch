import * as fs from "fs";
import * as path from "path";
import { parseEnv, serializeEnv } from "./parser";
import { maskEnv } from "./mask";

export interface Snapshot {
  timestamp: string;
  label: string;
  maskedEnv: Record<string, string>;
  keys: string[];
}

/**
 * Create a snapshot of an env file, masking sensitive values.
 */
export function createSnapshot(envContent: string, label: string): Snapshot {
  const parsed = parseEnv(envContent);
  const masked = maskEnv(parsed);
  return {
    timestamp: new Date().toISOString(),
    label,
    maskedEnv: masked,
    keys: Object.keys(parsed),
  };
}

/**
 * Save a snapshot to a JSON file.
 */
export function saveSnapshot(snapshot: Snapshot, outputPath: string): void {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2), "utf-8");
}

/**
 * Load a snapshot from a JSON file.
 */
export function loadSnapshot(filePath: string): Snapshot {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Snapshot;
}

/**
 * Compare two snapshots and return added/removed/present keys.
 */
export function compareSnapshots(
  before: Snapshot,
  after: Snapshot
): { added: string[]; removed: string[]; unchanged: string[] } {
  const beforeKeys = new Set(before.keys);
  const afterKeys = new Set(after.keys);

  const added = after.keys.filter((k) => !beforeKeys.has(k));
  const removed = before.keys.filter((k) => !afterKeys.has(k));
  const unchanged = after.keys.filter((k) => beforeKeys.has(k));

  return { added, removed, unchanged };
}

/**
 * Format a human-readable summary of a snapshot comparison.
 */
export function formatSnapshotComparison(
  before: Snapshot,
  after: Snapshot
): string {
  const { added, removed, unchanged } = compareSnapshots(before, after);
  const lines: string[] = [
    `Snapshot comparison: "${before.label}" → "${after.label}"`,
    `  Before: ${before.timestamp}`,
    `  After:  ${after.timestamp}`,
    `  Keys unchanged: ${unchanged.length}`,
  ];
  if (added.length > 0) lines.push(`  Keys added (+${added.length}): ${added.join(", ")}`);
  if (removed.length > 0) lines.push(`  Keys removed (-${removed.length}): ${removed.join(", ")}`);
  return lines.join("\n");
}
