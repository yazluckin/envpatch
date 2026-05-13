import { dedupEnv, formatDedupSummary } from "./dedup";

describe("dedupEnv", () => {
  it("returns all entries unchanged when no duplicates exist", () => {
    const entries: Array<[string, string]> = [
      ["FOO", "bar"],
      ["BAZ", "qux"],
    ];
    const { deduped, duplicates } = dedupEnv(entries);
    expect(deduped).toEqual({ FOO: "bar", BAZ: "qux" });
    expect(duplicates).toEqual({});
  });

  it("keeps last occurrence by default", () => {
    const entries: Array<[string, string]> = [
      ["FOO", "first"],
      ["BAR", "only"],
      ["FOO", "second"],
      ["FOO", "third"],
    ];
    const { deduped, duplicates } = dedupEnv(entries);
    expect(deduped["FOO"]).toBe("third");
    expect(deduped["BAR"]).toBe("only");
    expect(duplicates["FOO"]).toEqual(["first", "second", "third"]);
  });

  it("keeps first occurrence when keep=first", () => {
    const entries: Array<[string, string]> = [
      ["FOO", "first"],
      ["FOO", "second"],
    ];
    const { deduped } = dedupEnv(entries, { keep: "first" });
    expect(deduped["FOO"]).toBe("first");
  });

  it("handles multiple duplicate keys independently", () => {
    const entries: Array<[string, string]> = [
      ["A", "1"],
      ["B", "x"],
      ["A", "2"],
      ["B", "y"],
    ];
    const { deduped, duplicates } = dedupEnv(entries);
    expect(deduped["A"]).toBe("2");
    expect(deduped["B"]).toBe("y");
    expect(Object.keys(duplicates)).toHaveLength(2);
  });

  it("handles empty value duplicates", () => {
    const entries: Array<[string, string]> = [
      ["EMPTY", ""],
      ["EMPTY", "filled"],
    ];
    const { deduped, duplicates } = dedupEnv(entries);
    expect(deduped["EMPTY"]).toBe("filled");
    expect(duplicates["EMPTY"]).toEqual(["", "filled"]);
  });
});

describe("formatDedupSummary", () => {
  it("reports no duplicates when result is clean", () => {
    const result = { deduped: { FOO: "bar" }, duplicates: {} };
    expect(formatDedupSummary(result)).toBe("No duplicate keys found.");
  });

  it("lists duplicate keys and their values", () => {
    const result = {
      deduped: { FOO: "second" },
      duplicates: { FOO: ["first", "second"] },
    };
    const summary = formatDedupSummary(result);
    expect(summary).toContain("1 duplicate key(s)");
    expect(summary).toContain("FOO");
    expect(summary).toContain("first");
    expect(summary).toContain("kept");
  });

  it("marks empty values as (empty) in output", () => {
    const result = {
      deduped: { KEY: "val" },
      duplicates: { KEY: ["", "val"] },
    };
    const summary = formatDedupSummary(result);
    expect(summary).toContain("(empty)");
  });
});
