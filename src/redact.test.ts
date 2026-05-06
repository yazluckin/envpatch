import { describe, it, expect } from "vitest";
import { redactEnv, formatRedactSummary } from "./redact.js";

const sampleEnv = {
  APP_NAME: "myapp",
  DATABASE_URL: "postgres://user:pass@localhost/db",
  SECRET_KEY: "supersecret",
  API_KEY: "abc123",
  PORT: "3000",
  PASSWORD: "hunter2",
};

describe("redactEnv", () => {
  it("redacts sensitive keys via auto-detection", () => {
    const result = redactEnv(sampleEnv);
    expect(result.env.SECRET_KEY).toBe("[REDACTED]");
    expect(result.env.API_KEY).toBe("[REDACTED]");
    expect(result.env.PASSWORD).toBe("[REDACTED]");
    expect(result.env.DATABASE_URL).toBe("[REDACTED]");
  });

  it("leaves non-sensitive keys unchanged", () => {
    const result = redactEnv(sampleEnv);
    expect(result.env.APP_NAME).toBe("myapp");
    expect(result.env.PORT).toBe("3000");
  });

  it("redacts explicit keys regardless of name", () => {
    const result = redactEnv(sampleEnv, {
      keys: ["APP_NAME", "PORT"],
      autoDetect: false,
    });
    expect(result.env.APP_NAME).toBe("[REDACTED]");
    expect(result.env.PORT).toBe("[REDACTED]");
    expect(result.env.SECRET_KEY).toBe("supersecret");
    expect(result.redacted).toContain("APP_NAME");
    expect(result.redacted).toContain("PORT");
  });

  it("uses a custom placeholder", () => {
    const result = redactEnv(sampleEnv, { placeholder: "***" });
    expect(result.env.SECRET_KEY).toBe("***");
  });

  it("returns correct redacted and unchanged lists", () => {
    const result = redactEnv({ FOO: "bar", BAZ: "qux" }, { autoDetect: false, keys: ["FOO"] });
    expect(result.redacted).toEqual(["FOO"]);
    expect(result.unchanged).toEqual(["BAZ"]);
  });

  it("handles empty env", () => {
    const result = redactEnv({});
    expect(result.env).toEqual({});
    expect(result.redacted).toEqual([]);
    expect(result.unchanged).toEqual([]);
  });

  it("combines autoDetect and explicit keys", () => {
    const result = redactEnv(
      { APP_NAME: "myapp", SECRET_KEY: "s3cr3t", CUSTOM: "value" },
      { keys: ["CUSTOM"], autoDetect: true }
    );
    expect(result.env.APP_NAME).toBe("myapp");
    expect(result.env.SECRET_KEY).toBe("[REDACTED]");
    expect(result.env.CUSTOM).toBe("[REDACTED]");
  });
});

describe("formatRedactSummary", () => {
  it("reports no redactions when none occurred", () => {
    const result = redactEnv({ FOO: "bar" }, { autoDetect: false });
    const summary = formatRedactSummary(result);
    expect(summary).toContain("No keys were redacted");
  });

  it("lists redacted keys", () => {
    const result = redactEnv(sampleEnv);
    const summary = formatRedactSummary(result);
    expect(summary).toContain("SECRET_KEY");
    expect(summary).toContain("Redacted");
  });

  it("shows unchanged count", () => {
    const result = redactEnv(sampleEnv);
    const summary = formatRedactSummary(result);
    expect(summary).toContain("Unchanged");
  });
});
