import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  createSnapshot,
  saveSnapshot,
  loadSnapshot,
  compareSnapshots,
  formatSnapshotComparison,
} from "./snapshot";

const TMP_DIR = path.join(__dirname, "__tmp_snapshot__");

beforeEach(() => {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
});

afterEach(() => {
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
});

describe("createSnapshot", () => {
  it("captures keys and masks sensitive values", () => {
    const env = "API_KEY=secret123\nAPP_NAME=myapp\nDB_PASSWORD=hunter2";
    const snap = createSnapshot(env, "test");
    expect(snap.keys).toContain("API_KEY");
    expect(snap.keys).toContain("APP_NAME");
    expect(snap.maskedEnv["API_KEY"]).not.toBe("secret123");
    expect(snap.maskedEnv["APP_NAME"]).toBe("myapp");
    expect(snap.label).toBe("test");
    expect(snap.timestamp).toBeTruthy();
  });

  it("handles empty env content", () => {
    const snap = createSnapshot("", "empty");
    expect(snap.keys).toHaveLength(0);
    expect(snap.maskedEnv).toEqual({});
  });
});

describe("saveSnapshot / loadSnapshot", () => {
  it("round-trips a snapshot to disk", () => {
    const env = "FOO=bar\nSECRET_KEY=abc";
    const snap = createSnapshot(env, "roundtrip");
    const outPath = path.join(TMP_DIR, "snap.json");
    saveSnapshot(snap, outPath);
    const loaded = loadSnapshot(outPath);
    expect(loaded.label).toBe("roundtrip");
    expect(loaded.keys).toEqual(snap.keys);
    expect(loaded.maskedEnv).toEqual(snap.maskedEnv);
  });

  it("creates parent directories if needed", () => {
    const snap = createSnapshot("X=1", "nested");
    const outPath = path.join(TMP_DIR, "nested", "deep", "snap.json");
    saveSnapshot(snap, outPath);
    expect(fs.existsSync(outPath)).toBe(true);
  });

  it("throws when loading a non-existent file", () => {
    const missingPath = path.join(TMP_DIR, "does_not_exist.json");
    expect(() => loadSnapshot(missingPath)).toThrow();
  });
});

describe("compareSnapshots", () => {
  it("detects added and removed keys", () => {
    const before = createSnapshot("A=1\nB=2", "before");
    const after = createSnapshot("B=2\nC=3", "after");
    const result = compareSnapshots(before, after);
    expect(result.added).toContain("C");
    expect(result.removed).toContain("A");
    expect(result.unchanged).toContain("B");
  });

  it("returns empty arrays when snapshots are identical", () => {
    const snap = createSnapshot("X=1\nY=2", "same");
    const result = compareSnapshots(snap, snap);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.unchanged).toHaveLength(2);
  });
});

describe("formatSnapshotComparison", () => {
  it("includes label, timestamps, and key changes", () => {
    const before = createSnapshot("A=1\nB=2", "v1");
    const after = createSnapshot("B=2\nC=3", "v2");
    const summary = formatSnapshotComparison(before, after);
    expect(summary).toContain("v1");
    expect(summary).toContain("v2");
    expect(summary).toContain("+1");
    expect(summary).toContain("-1");
  });
});
