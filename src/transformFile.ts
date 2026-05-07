import * as fs from "fs";
import { parseEnv, serializeEnv } from "./parser";
import {
  transformEnv,
  formatTransformSummary,
  TransformRule,
  TransformResult,
} from "./transform";

export async function transformEnvFile(
  filePath: string,
  rules: TransformRule[],
  outputPath?: string
): Promise<TransformResult> {
  const raw = await fs.promises.readFile(filePath, "utf-8");
  const env = parseEnv(raw);
  const result = transformEnv(env, rules);

  const dest = outputPath ?? filePath;
  await fs.promises.writeFile(dest, serializeEnv(result.transformed), "utf-8");

  return result;
}

export async function transformEnvFileAndReport(
  filePath: string,
  rules: TransformRule[],
  outputPath?: string
): Promise<void> {
  const result = await transformEnvFile(filePath, rules, outputPath);
  console.log(formatTransformSummary(result));
}
