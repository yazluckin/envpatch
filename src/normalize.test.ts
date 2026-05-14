import { describe, it, expect } from "vitest";
import { normalizeEnv, formatNormalizeSummary } from "./normalize";

describe("normalizeEnv", () => {
  it("uppercases keys by default", () => {
    const { normalized, changes } = normalizeEnv({ api_key: "abc", Port: "3000" });
    expect(normalized).toEqual({ API_KEY: "abc", PORT: "3000" });
    expect(changes).toHaveLength(2);
    expect(changes[0].type).toBe("key_renamed");
  });

  it("does not rename already-uppercase keys", () => {
    const { changes } = normalizeEnv({ API_KEY: "abc" });
    expect(changes).toHaveLength(0);
  });

  it("trims values by default", () => {
    const { normalized, changes } = normalizeEnv({ KEY: "  hello  " });
    expect(normalized["KEY"]).toBe("hello");
    expect(changes[0].type).toBe("value_trimmed");
  });

  it("does not trim when trimValues is false", () => {
    const { normalized } = normalizeEnv({ KEY: "  hello  " }, { trimValues: false });
    expect(normalized["KEY"]).toBe("  hello  ");
  });

  it("removes empty values when removeEmpty is true", () => {
    const { normalized, changes } = normalizeEnv(
      { KEY: "", OTHER: "val" },
      { removeEmpty: true }
    );
    expect(normalized).not.toHaveProperty("KEY");
    expect(normalized["OTHER"]).toBe("val");
    expect(changes[0].type).toBe("removed_empty");
  });

  it("keeps empty values when removeEmpty is false", () => {
    const { normalized } = normalizeEnv({ KEY: "" }, { removeEmpty: false });
    expect(normalized).toHaveProperty("KEY");
  });

  it("collapses internal whitespace when collapseWhitespace is true", () => {
    const { normalized, changes } = normalizeEnv(
      { KEY: "hello   world" },
      { collapseWhitespace: true }
    );
    expect(normalized["KEY"]).toBe("hello world");
    expect(changes[0].type).toBe("value_collapsed");
  });

  it("does not collapse whitespace by default", () => {
    const { normalized } = normalizeEnv({ KEY: "hello   world" });
    expect(normalized["KEY"]).toBe("hello   world");
  });

  it("applies key rename then value transforms using renamed key", () => {
    const { normalized } = normalizeEnv({ my_key: "  val  " });
    expect(normalized).toHaveProperty("MY_KEY", "val");
  });
});

describe("formatNormalizeSummary", () => {
  it("returns no-change message when empty", () => {
    const result = normalizeEnv({ KEY: "val" });
    expect(formatNormalizeSummary(result)).toBe("No normalization changes.");
  });

  it("lists all change types", () => {
    const result = normalizeEnv(
      { my_key: "  hello   world  ", empty: "" },
      { collapseWhitespace: true, removeEmpty: true }
    );
    const summary = formatNormalizeSummary(result);
    expect(summary).toContain("renamed key");
    expect(summary).toContain("trimmed value");
    expect(summary).toContain("collapsed whitespace");
    expect(summary).toContain("removed empty");
  });
});
