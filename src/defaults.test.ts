import { applyDefaults, formatDefaultsSummary } from "./defaults";

describe("applyDefaults", () => {
  it("applies missing keys from defaults", () => {
    const source = { EXISTING: "value" };
    const defaults = { EXISTING: "default", NEW_KEY: "new_value" };
    const result = applyDefaults(source, defaults);

    expect(result.output["NEW_KEY"]).toBe("new_value");
    expect(result.output["EXISTING"]).toBe("value");
    expect(result.applied["NEW_KEY"]).toBe("new_value");
    expect(result.skipped["EXISTING"]).toBe("value");
  });

  it("overwrites empty keys when overwriteEmpty is true", () => {
    const source = { EMPTY_KEY: "" };
    const defaults = { EMPTY_KEY: "filled" };
    const result = applyDefaults(source, defaults, true);

    expect(result.output["EMPTY_KEY"]).toBe("filled");
    expect(result.applied["EMPTY_KEY"]).toBe("filled");
  });

  it("does not overwrite empty keys when overwriteEmpty is false", () => {
    const source = { EMPTY_KEY: "" };
    const defaults = { EMPTY_KEY: "filled" };
    const result = applyDefaults(source, defaults, false);

    expect(result.output["EMPTY_KEY"]).toBe("");
    expect(result.skipped["EMPTY_KEY"]).toBe("");
  });

  it("does not overwrite keys that already have values", () => {
    const source = { KEY: "original" };
    const defaults = { KEY: "default" };
    const result = applyDefaults(source, defaults);

    expect(result.output["KEY"]).toBe("original");
    expect(result.skipped["KEY"]).toBe("original");
  });

  it("returns empty applied/skipped when defaults is empty", () => {
    const source = { KEY: "value" };
    const result = applyDefaults(source, {});

    expect(Object.keys(result.applied)).toHaveLength(0);
    expect(Object.keys(result.skipped)).toHaveLength(0);
    expect(result.output).toEqual(source);
  });
});

describe("formatDefaultsSummary", () => {
  it("returns a no-op message when nothing changes", () => {
    const result = { applied: {}, skipped: {}, output: {} };
    expect(formatDefaultsSummary(result)).toBe("No defaults to apply.");
  });

  it("lists applied and skipped keys", () => {
    const result = {
      applied: { NEW_KEY: "value" },
      skipped: { OLD_KEY: "existing" },
      output: { NEW_KEY: "value", OLD_KEY: "existing" },
    };
    const summary = formatDefaultsSummary(result);
    expect(summary).toContain("Applied 1 default(s)");
    expect(summary).toContain("+ NEW_KEY");
    expect(summary).toContain("Skipped 1 key(s)");
    expect(summary).toContain("~ OLD_KEY");
  });
});
