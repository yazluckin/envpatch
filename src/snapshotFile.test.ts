import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { snapshotEnvFile, listSnapshots, compareLatestSnapshots } from "./snapshotFile";

const TMP_DIR = path.join(__dirname, "__tmp_snapshotfile__");
const SNAP_DIR = path.join(TMP_DIR, "snapshots");
const ENV_FILE = path.join(TMP_DIR, ".env");

beforeEach(() => {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  fs.writeFileSync(ENV_FILE, "APP_NAME=envpatch\nAPI_KEY=supersecret\nPORT=3000", "utf-8");
});

afterEach(() => {
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
});

describe("snapshotEnvFile", () => {
  it("creates a snapshot JSON file in the snapshot directory", () => {
    const outPath = snapshotEnvFile(ENV_FILE, "test", SNAP_DIR);
    expect(fs.existsSync(outPath)).toBe(true);
    const data = JSON.parse(fs.readFileSync(outPath, "utf-8"));
    expect(data.label).toBe("test");
    expect(data.keys).toContain("APP_NAME");
    expect(data.maskedEnv["API_KEY"]).not.toBe("supersecret");
  });

  it("uses basename as label when no label provided", () => {
    const outPath = snapshotEnvFile(ENV_FILE, undefined, SNAP_DIR);
    const data = JSON.parse(fs.readFileSync(outPath, "utf-8"));
    expect(data.label).toBe(".env");
  });

  it("returns the path to the created snapshot file", () => {
    const outPath = snapshotEnvFile(ENV_FILE, "myenv", SNAP_DIR);
    expect(outPath).toContain(SNAP_DIR);
    expect(outPath).toContain(".json");
  });
});

describe("listSnapshots", () => {
  it("returns empty array when directory does not exist", () => {
    expect(listSnapshots(path.join(TMP_DIR, "nonexistent"))).toEqual([]);
  });

  it("lists snapshot files in sorted order", () => {
    snapshotEnvFile(ENV_FILE, "snap-a", SNAP_DIR);
    snapshotEnvFile(ENV_FILE, "snap-b", SNAP_DIR);
    const files = listSnapshots(SNAP_DIR);
    expect(files.length).toBe(2);
    expect(files[0] < files[1]).toBe(true);
  });
});

describe("compareLatestSnapshots", () => {
  it("returns not-enough message when fewer than 2 snapshots exist", () => {
    snapshotEnvFile(ENV_FILE, "only-one", SNAP_DIR);
    const result = compareLatestSnapshots(SNAP_DIR);
    expect(result).toContain("Not enough snapshots");
  });

  it("returns a comparison summary for two snapshots", async () => {
    snapshotEnvFile(ENV_FILE, "before", SNAP_DIR);
    await new Promise((r) => setTimeout(r, 10));
    fs.writeFileSync(ENV_FILE, "APP_NAME=envpatch\nNEW_VAR=hello\nPORT=3000", "utf-8");
    snapshotEnvFile(ENV_FILE, "after", SNAP_DIR);
    const result = compareLatestSnapshots(SNAP_DIR);
    expect(result).toContain("before");
    expect(result).toContain("after");
  });
});
