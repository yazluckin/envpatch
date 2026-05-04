import * as fs from "fs";
import * as path from "path";
import { createSnapshot, saveSnapshot, loadSnapshot, formatSnapshotComparison, Snapshot } from "./snapshot";

/**
 * Take a snapshot of an .env file and save it to the snapshots directory.
 * Returns the path of the saved snapshot file.
 */
export function snapshotEnvFile(
  envFilePath: string,
  label?: string,
  snapshotDir: string = ".env-snapshots"
): string {
  const content = fs.readFileSync(envFilePath, "utf-8");
  const resolvedLabel = label ?? path.basename(envFilePath);
  const snapshot = createSnapshot(content, resolvedLabel);

  const safeTimestamp = snapshot.timestamp.replace(/[:.]/g, "-");
  const fileName = `${resolvedLabel.replace(/[^a-zA-Z0-9_-]/g, "_")}_${safeTimestamp}.json`;
  const outputPath = path.join(snapshotDir, fileName);

  saveSnapshot(snapshot, outputPath);
  return outputPath;
}

/**
 * List all snapshot files in a directory, sorted by filename (chronological).
 */
export function listSnapshots(snapshotDir: string = ".env-snapshots"): string[] {
  if (!fs.existsSync(snapshotDir)) return [];
  return fs
    .readdirSync(snapshotDir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => path.join(snapshotDir, f));
}

/**
 * Compare the two most recent snapshots in a directory and return a summary.
 */
export function compareLatestSnapshots(
  snapshotDir: string = ".env-snapshots"
): string {
  const files = listSnapshots(snapshotDir);
  if (files.length < 2) {
    return "Not enough snapshots to compare (need at least 2).";
  }
  const before: Snapshot = loadSnapshot(files[files.length - 2]);
  const after: Snapshot = loadSnapshot(files[files.length - 1]);
  return formatSnapshotComparison(before, after);
}
