import { describe, it, expect } from "vitest";
import { flattenEnv, formatFlattenSummary } from "./flatten";

const sampleEnv = {
  db_host: "localhost",
  db_port: "5432",
  api_key: "secret",
  debug: "true",
};

describe("flattenEnv", () => {
  it("returns original unchanged when no options provided", () => {
    const result = flattenEnv(sampleEnv);
    expect(result.flattened).toEqual(sampleEnv);
    expect(result.renamedKeys).toHaveLength(0);
  });

  it("uppercases all keys", () => {
    const result = flattenEnv(sampleEnv, { uppercase: true });
    expect(result.flattened).toHaveProperty("DB_HOST", "localhost");
    expect(result.flattened).toHaveProperty("API_KEY", "secret");
    expect(result.renamedKeys.length).toBe(Object.keys(sampleEnv).length);
  });

  it("adds prefix to keys that do not already have it", () => {
    const result = flattenEnv(sampleEnv, { prefix: "APP", separator: "_" });
    expect(result.flattened).toHaveProperty("APP_db_host", "localhost");
    expect(result.flattened).toHaveProperty("APP_debug", "true");
    expect(result.renamedKeys).toHaveLength(Object.keys(sampleEnv).length);
  });

  it("does not double-prefix keys that already start with prefix", () => {
    const env = { APP_db_host: "localhost", debug: "true" };
    const result = flattenEnv(env, { prefix: "APP", separator: "_" });
    expect(result.flattened).toHaveProperty("APP_db_host", "localhost");
    expect(result.flattened).toHaveProperty("APP_debug", "true");
    expect(result.renamedKeys).toHaveLength(1);
    expect(result.renamedKeys[0]).toEqual({ from: "debug", to: "APP_debug" });
  });

  it("applies both prefix and uppercase", () => {
    const result = flattenEnv({ host: "localhost" }, { prefix: "APP", separator: "_", uppercase: true });
    expect(result.flattened).toHaveProperty("APP_HOST", "localhost");
  });

  it("preserves values exactly", () => {
    const env = { KEY: "value with spaces", OTHER: "123" };
    const result = flattenEnv(env, { uppercase: true });
    expect(result.flattened["KEY"]).toBe("value with spaces");
    expect(result.flattened["OTHER"]).toBe("123");
  });
});

describe("formatFlattenSummary", () => {
  it("reports total, unchanged, and renamed counts", () => {
    const result = flattenEnv(sampleEnv, { uppercase: true });
    const summary = formatFlattenSummary(result);
    expect(summary).toContain("4 key(s) total");
    expect(summary).toContain("Renamed   : 4");
    expect(summary).toContain("Unchanged : 0");
  });

  it("includes renamed key pairs in output", () => {
    const result = flattenEnv({ mykey: "val" }, { uppercase: true });
    const summary = formatFlattenSummary(result);
    expect(summary).toContain("mykey → MYKEY");
  });

  it("shows all unchanged when no options applied", () => {
    const result = flattenEnv(sampleEnv);
    const summary = formatFlattenSummary(result);
    expect(summary).toContain("Unchanged : 4");
    expect(summary).toContain("Renamed   : 0");
  });
});
