import { EnvRecord } from './parser';
import {
  EnvSchema,
  FieldSchema,
  FieldType,
  SchemaValidationResult,
  SchemaViolation,
} from './schema.types';

const TYPE_PATTERNS: Record<FieldType, RegExp> = {
  string: /.*/,
  number: /^-?\d+(\.\d+)?$/,
  boolean: /^(true|false|1|0)$/i,
  url: /^https?:\/\/.+/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

function validateField(
  key: string,
  value: string | undefined,
  schema: FieldSchema
): SchemaViolation[] {
  const violations: SchemaViolation[] = [];

  if (value === undefined || value === '') {
    if (schema.required) {
      violations.push({ key, value, rule: 'required', message: `"${key}" is required but missing or empty` });
    }
    return violations;
  }

  if (schema.type && schema.type !== 'string') {
    if (!TYPE_PATTERNS[schema.type].test(value)) {
      violations.push({ key, value, rule: 'type', message: `"${key}" must be of type ${schema.type}` });
    }
  }

  if (schema.pattern && !schema.pattern.test(value)) {
    violations.push({ key, value, rule: 'pattern', message: `"${key}" does not match required pattern` });
  }

  if (schema.minLength !== undefined && value.length < schema.minLength) {
    violations.push({ key, value, rule: 'minLength', message: `"${key}" must be at least ${schema.minLength} characters` });
  }

  if (schema.maxLength !== undefined && value.length > schema.maxLength) {
    violations.push({ key, value, rule: 'maxLength', message: `"${key}" must be at most ${schema.maxLength} characters` });
  }

  if (schema.allowedValues && !schema.allowedValues.includes(value)) {
    violations.push({ key, value, rule: 'allowedValues', message: `"${key}" must be one of: ${schema.allowedValues.join(', ')}` });
  }

  return violations;
}

export function validateEnvSchema(
  env: EnvRecord,
  schema: EnvSchema,
  options: { allowUnknown?: boolean } = {}
): SchemaValidationResult {
  const violations: SchemaViolation[] = [];
  const missingRequired: string[] = [];
  const unknownKeys: string[] = [];

  for (const [key, fieldSchema] of Object.entries(schema)) {
    const value = env[key];
    if (fieldSchema.required && (value === undefined || value === '')) {
      missingRequired.push(key);
    }
    const fieldViolations = validateField(key, value, fieldSchema);
    violations.push(...fieldViolations.filter(v => v.rule !== 'required'));
  }

  if (!options.allowUnknown) {
    for (const key of Object.keys(env)) {
      if (!schema[key]) {
        unknownKeys.push(key);
      }
    }
  }

  return {
    valid: violations.length === 0 && missingRequired.length === 0,
    violations,
    missingRequired,
    unknownKeys,
  };
}

export function formatSchemaValidationSummary(result: SchemaValidationResult): string {
  const lines: string[] = [];

  if (result.valid && result.unknownKeys.length === 0) {
    lines.push('✅ Schema validation passed.');
    return lines.join('\n');
  }

  if (result.missingRequired.length > 0) {
    lines.push(`❌ Missing required keys (${result.missingRequired.length}):`);
    result.missingRequired.forEach(k => lines.push(`  - ${k}`));
  }

  if (result.violations.length > 0) {
    lines.push(`⚠️  Violations (${result.violations.length}):`);
    result.violations.forEach(v => lines.push(`  [${v.rule}] ${v.message}`));
  }

  if (result.unknownKeys.length > 0) {
    lines.push(`🔍 Unknown keys (${result.unknownKeys.length}):`);
    result.unknownKeys.forEach(k => lines.push(`  - ${k}`));
  }

  return lines.join('\n');
}
