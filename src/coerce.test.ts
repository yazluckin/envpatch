import { coerceEnv, formatCoerceSummary, CoerceRule } from "./coerce";
import { EnvMap } from "./parser";

describe("coerceEnv", () => {
  const env: EnvMap = {
    PORT: "3000",
    DEBUG: "true",
    RATIO: "0.75",
    CONFIG: '{"timeout":30}',
    NAME: "myapp",
  };

  it("coerces a number value", () => {
    const rules: CoerceRule[] = [{ key: "PORT", type: "number" }];
    const result = coerceEnv(env, rules);
    expect(result.coerced["PORT"]).toBe(3000);
    expect(result.errors).toHaveLength(0);
  });

  it("coerces a boolean value (true)", () => {
    const rules: CoerceRule[] = [{ key: "DEBUG", type: "boolean" }];
    const result = coerceEnv(env, rules);
    expect(result.coerced["DEBUG"]).toBe(true);
  });

  it("coerces a boolean value with 'false' string", () => {
    const rules: CoerceRule[] = [{ key: "PORT", type: "boolean" }];
    const result = coerceEnv({ PORT: "false" }, rules);
    expect(result.coerced["PORT"]).toBe(false);
  });

  it("coerces a JSON value", () => {
    const rules: CoerceRule[] = [{ key: "CONFIG", type: "json" }];
    const result = coerceEnv(env, rules);
    expect(result.coerced["CONFIG"]).toEqual({ timeout: 30 });
  });

  it("coerces a string value (identity)", () => {
    const rules: CoerceRule[] = [{ key: "NAME", type: "string" }];
    const result = coerceEnv(env, rules);
    expect(result.coerced["NAME"]).toBe("myapp");
  });

  it("skips missing keys", () => {
    const rules: CoerceRule[] = [{ key: "MISSING", type: "number" }];
    const result = coerceEnv(env, rules);
    expect(result.skipped).toContain("MISSING");
    expect(result.coerced["MISSING"]).toBeUndefined();
  });

  it("records an error for invalid number", () => {
    const rules: CoerceRule[] = [{ key: "NAME", type: "number" }];
    const result = coerceEnv(env, rules);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].key).toBe("NAME");
  });

  it("records an error for invalid boolean", () => {
    const rules: CoerceRule[] = [{ key: "NAME", type: "boolean" }];
    const result = coerceEnv(env, rules);
    expect(result.errors[0].key).toBe("NAME");
  });

  it("records an error for invalid JSON", () => {
    const rules: CoerceRule[] = [{ key: "NAME", type: "json" }];
    const result = coerceEnv(env, rules);
    expect(result.errors[0].key).toBe("NAME");
  });

  it("handles multiple rules at once", () => {
    const rules: CoerceRule[] = [
      { key: "PORT", type: "number" },
      { key: "DEBUG", type: "boolean" },
      { key: "NAME", type: "string" },
    ];
    const result = coerceEnv(env, rules);
    expect(Object.keys(result.coerced)).toHaveLength(3);
    expect(result.errors).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
  });
});

describe("formatCoerceSummary", () => {
  it("formats a summary with no issues", () => {
    const result = { coerced: { PORT: 3000 }, skipped: [], errors: [] };
    const summary = formatCoerceSummary(result);
    expect(summary).toContain("Coerced: 1 key(s)");
    expect(summary).not.toContain("Skipped");
    expect(summary).not.toContain("Errors");
  });

  it("includes skipped keys in summary", () => {
    const result = { coerced: {}, skipped: ["MISSING"], errors: [] };
    const summary = formatCoerceSummary(result);
    expect(summary).toContain("Skipped (missing): MISSING");
  });

  it("includes errors in summary", () => {
    const result = {
      coerced: {},
      skipped: [],
      errors: [{ key: "NAME", reason: "Cannot coerce \"myapp\" to number" }],
    };
    const summary = formatCoerceSummary(result);
    expect(summary).toContain("Errors:");
    expect(summary).toContain("NAME");
  });
});
