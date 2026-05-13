import * as fs from "fs";
import { parseEnv } from "./parser";
import { coerceEnv, CoerceRule, CoerceResult, formatCoerceSummary } from "./coerce";

export function coerceEnvFile(
  filePath: string,
  rules: CoerceRule[]
): CoerceResult {
  const raw = fs.readFileSync(filePath, "utf-8");
  const env = parseEnv(raw);
  return coerceEnv(env, rules);
}

export function coerceEnvFileAndReport(
  filePath: string,
  rules: CoerceRule[]
): { result: CoerceResult; summary: string } {
  const result = coerceEnvFile(filePath, rules);
  const summary = formatCoerceSummary(result);
  return { result, summary };
}
