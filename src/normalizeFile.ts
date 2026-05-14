import * as fs from "fs";
import { parseEnv, serializeEnv } from "./parser";
import { normalizeEnv, NormalizeOptions, NormalizeResult, formatNormalizeSummary } from "./normalize";

export function normalizeEnvFile(
  filePath: string,
  options: NormalizeOptions = {}
): NormalizeResult {
  const raw = fs.readFileSync(filePath, "utf-8");
  const env = parseEnv(raw);
  const result = normalizeEnv(env, options);
  fs.writeFileSync(filePath, serializeEnv(result.normalized), "utf-8");
  return result;
}

export function normalizeEnvFileAndReport(
  filePath: string,
  options: NormalizeOptions = {}
): void {
  const result = normalizeEnvFile(filePath, options);
  console.log(formatNormalizeSummary(result));
}
