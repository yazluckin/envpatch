import { validateEnv, formatValidationSummary } from "./validate";

describe("validateEnv", () => {
  const env = {
    DB_HOST: "localhost",
    DB_PORT: "5432",
    API_KEY: "secret",
  };

  it("passes when all required keys are present", () => {
    const result = validateEnv(env, { required: ["DB_HOST", "DB_PORT"] });
    expect(result.valid).toBe(true);
    expect(result.missing).toEqual([]);
  });

  it("fails when a required key is missing", () => {
    const result = validateEnv(env, { required: ["DB_HOST", "DB_PASSWORD"] });
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("DB_PASSWORD");
  });

  it("reports unknown keys when schema defines known keys", () => {
    const result = validateEnv(env, {
      required: ["DB_HOST", "DB_PORT"],
      optional: ["API_KEY"],
    });
    expect(result.unknown).toEqual([]);
  });

  it("reports unknown keys not in required or optional", () => {
    const result = validateEnv(env, {
      required: ["DB_HOST"],
      optional: ["DB_PORT"],
    });
    expect(result.unknown).toContain("API_KEY");
    expect(result.warnings.some((w) => w.includes("API_KEY"))).toBe(true);
  });

  it("does not report unknown keys when schema has no known keys", () => {
    const result = validateEnv(env, {});
    expect(result.unknown).toEqual([]);
  });

  it("warns when a required key is present but empty", () => {
    const result = validateEnv(
      { DB_HOST: "", DB_PORT: "5432" },
      { required: ["DB_HOST", "DB_PORT"] }
    );
    expect(result.valid).toBe(false);
    expect(result.missing).toContain("DB_HOST");
    expect(result.warnings.some((w) => w.includes("DB_HOST"))).toBe(true);
  });

  it("returns valid=true with no schema keys", () => {
    const result = validateEnv(env, {});
    expect(result.valid).toBe(true);
  });
});

describe("formatValidationSummary", () => {
  it("shows passed message when valid", () => {
    const result = validateEnv({ A: "1" }, { required: ["A"] });
    const summary = formatValidationSummary(result);
    expect(summary).toContain("✔ Validation passed.");
  });

  it("shows failed message and missing keys when invalid", () => {
    const result = validateEnv({}, { required: ["A", "B"] });
    const summary = formatValidationSummary(result);
    expect(summary).toContain("✘ Validation failed.");
    expect(summary).toContain("- A");
    expect(summary).toContain("- B");
  });

  it("includes warnings in summary", () => {
    const result = validateEnv(
      { A: "1", C: "3" },
      { required: ["A"], optional: ["B"] }
    );
    const summary = formatValidationSummary(result);
    expect(summary).toContain("! Unknown key: C");
  });
});
