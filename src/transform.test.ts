import { describe, it, expect } from "vitest";
import { transformEnv, formatTransformSummary, TransformRule } from "./transform";

const sampleEnv = {
  APP_NAME: "myapp",
  DB_HOST: "localhost",
  DB_PORT: "5432",
  API_URL: "http://example.com",
};

describe("transformEnv", () => {
  it("returns unchanged env when no rules match", () => {
    const result = transformEnv(sampleEnv, []);
    expect(result.transformed).toEqual(sampleEnv);
    expect(result.changes).toHaveLength(0);
  });

  it("applies a string-key match rule", () => {
    const rules: TransformRule[] = [
      { match: "APP_NAME", transform: (_k, v) => v.toUpperCase() },
    ];
    const result = transformEnv(sampleEnv, rules);
    expect(result.transformed["APP_NAME"]).toBe("MYAPP");
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0]).toEqual({
      key: "APP_NAME",
      before: "myapp",
      after: "MYAPP",
    });
  });

  it("applies a regex match rule to multiple keys", () => {
    const rules: TransformRule[] = [
      { match: /^DB_/, transform: (_k, v) => `prod-${v}` },
    ];
    const result = transformEnv(sampleEnv, rules);
    expect(result.transformed["DB_HOST"]).toBe("prod-localhost");
    expect(result.transformed["DB_PORT"]).toBe("prod-5432");
    expect(result.transformed["APP_NAME"]).toBe("myapp");
    expect(result.changes).toHaveLength(2);
  });

  it("first matching rule wins", () => {
    const rules: TransformRule[] = [
      { match: /^DB_/, transform: (_k, v) => `first-${v}` },
      { match: "DB_HOST", transform: (_k, v) => `second-${v}` },
    ];
    const result = transformEnv(sampleEnv, rules);
    expect(result.transformed["DB_HOST"]).toBe("first-localhost");
  });

  it("does not record a change when transform returns same value", () => {
    const rules: TransformRule[] = [
      { match: "DB_PORT", transform: (_k, v) => v },
    ];
    const result = transformEnv(sampleEnv, rules);
    expect(result.changes).toHaveLength(0);
  });

  it("preserves original env map", () => {
    const rules: TransformRule[] = [
      { match: "APP_NAME", transform: () => "changed" },
    ];
    const result = transformEnv(sampleEnv, rules);
    expect(result.original["APP_NAME"]).toBe("myapp");
  });
});

describe("formatTransformSummary", () => {
  it("reports no changes when nothing transformed", () => {
    const result = transformEnv(sampleEnv, []);
    expect(formatTransformSummary(result)).toBe("No values were transformed.");
  });

  it("lists changed keys with before/after", () => {
    const rules: TransformRule[] = [
      { match: "APP_NAME", transform: () => "MYAPP" },
    ];
    const result = transformEnv(sampleEnv, rules);
    const summary = formatTransformSummary(result);
    expect(summary).toContain("Transformed 1 value(s)");
    expect(summary).toContain("APP_NAME");
    expect(summary).toContain("before: myapp");
    expect(summary).toContain("after:  MYAPP");
  });
});
