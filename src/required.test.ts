import { describe, it, expect } from "vitest";
import {
  checkRequired,
  allRequiredPresent,
  formatRequiredSummary,
} from "./required";

const sampleEnv = {
  DATABASE_URL: "postgres://localhost/db",
  API_KEY: "abc123",
  PORT: "3000",
  EMPTY_VAR: "",
};

describe("checkRequired", () => {
  it("reports all present when all keys exist and are non-empty", () => {
    const result = checkRequired(sampleEnv, ["DATABASE_URL", "API_KEY", "PORT"]);
    expect(result.missing).toEqual([]);
    expect(result.present).toEqual(["DATABASE_URL", "API_KEY", "PORT"]);
    expect(result.total).toBe(3);
  });

  it("reports missing keys that are absent", () => {
    const result = checkRequired(sampleEnv, ["DATABASE_URL", "SECRET_KEY"]);
    expect(result.missing).toContain("SECRET_KEY");
    expect(result.present).toContain("DATABASE_URL");
  });

  it("treats empty string values as missing", () => {
    const result = checkRequired(sampleEnv, ["EMPTY_VAR"]);
    expect(result.missing).toContain("EMPTY_VAR");
  });

  it("handles an empty required list", () => {
    const result = checkRequired(sampleEnv, []);
    expect(result.missing).toEqual([]);
    expect(result.present).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("handles an empty env map", () => {
    const result = checkRequired({}, ["FOO", "BAR"]);
    expect(result.missing).toEqual(["FOO", "BAR"]);
    expect(result.present).toEqual([]);
  });
});

describe("allRequiredPresent", () => {
  it("returns true when all required keys are present", () => {
    expect(allRequiredPresent(sampleEnv, ["DATABASE_URL", "PORT"])).toBe(true);
  });

  it("returns false when a required key is missing", () => {
    expect(allRequiredPresent(sampleEnv, ["DATABASE_URL", "MISSING"])).toBe(
      false
    );
  });

  it("returns true for an empty required list", () => {
    expect(allRequiredPresent({}, [])).toBe(true);
  });
});

describe("formatRequiredSummary", () => {
  it("includes count of present and total", () => {
    const result = checkRequired(sampleEnv, ["DATABASE_URL", "MISSING_KEY"]);
    const summary = formatRequiredSummary(result);
    expect(summary).toContain("1/2 present");
  });

  it("lists missing keys", () => {
    const result = checkRequired(sampleEnv, ["MISSING_KEY"]);
    const summary = formatRequiredSummary(result);
    expect(summary).toContain("MISSING_KEY");
    expect(summary).toContain("Missing");
  });

  it("lists present keys with checkmark", () => {
    const result = checkRequired(sampleEnv, ["DATABASE_URL"]);
    const summary = formatRequiredSummary(result);
    expect(summary).toContain("✓ DATABASE_URL");
  });
});
