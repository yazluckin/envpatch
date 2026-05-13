import { readFileSync, writeFileSync } from "fs";
import { parseEnv, serializeEnv } from "./parser";
import { flattenEnv, FlattenOptions, FlattenResult, formatFlattenSummary } from "./flatten";

export function flattenEnvFile(
  inputPath: string,
  outputPath: string,
  options: FlattenOptions = {}
): FlattenResult {
  const raw = readFileSync(inputPath, "utf-8");
  const env = parseEnv(raw);
  const result = flattenEnv(env, options);
  writeFileSync(outputPath, serializeEnv(result.flattened), "utf-8");
  return result;
}

export function flattenEnvFileAndReport(
  inputPath: string,
  outputPath: string,
  options: FlattenOptions = {}
): string {
  const result = flattenEnvFile(inputPath, outputPath, options);
  return formatFlattenSummary(result);
}
