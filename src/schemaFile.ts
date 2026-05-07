import * as fs from 'fs';
import * as path from 'path';
import { parseEnv } from './parser';
import { EnvSchema, SchemaValidationResult } from './schema.types';
import { formatSchemaValidationSummary, validateEnvSchema } from './schema';

export function loadSchema(schemaPath: string): EnvSchema {
  const raw = fs.readFileSync(schemaPath, 'utf-8');
  const parsed = JSON.parse(raw);
  // Convert pattern strings back to RegExp if present
  for (const key of Object.keys(parsed)) {
    if (parsed[key].pattern && typeof parsed[key].pattern === 'string') {
      parsed[key].pattern = new RegExp(parsed[key].pattern);
    }
  }
  return parsed as EnvSchema;
}

export function validateEnvFileWithSchema(
  envPath: string,
  schemaPath: string,
  options: { allowUnknown?: boolean } = {}
): SchemaValidationResult {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = parseEnv(envContent);
  const schema = loadSchema(schemaPath);
  return validateEnvSchema(env, schema, options);
}

export function validateEnvFileWithSchemaAndReport(
  envPath: string,
  schemaPath: string,
  options: { allowUnknown?: boolean } = {}
): void {
  const result = validateEnvFileWithSchema(envPath, schemaPath, options);
  const summary = formatSchemaValidationSummary(result);
  console.log(`Schema validation: ${path.basename(envPath)} against ${path.basename(schemaPath)}`);
  console.log(summary);
  if (!result.valid) {
    process.exitCode = 1;
  }
}
