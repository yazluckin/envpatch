export type FieldType = 'string' | 'number' | 'boolean' | 'url' | 'email';

export interface FieldSchema {
  type?: FieldType;
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  allowedValues?: string[];
  description?: string;
}

export type EnvSchema = Record<string, FieldSchema>;

export interface SchemaViolation {
  key: string;
  value: string | undefined;
  rule: string;
  message: string;
}

export interface SchemaValidationResult {
  valid: boolean;
  violations: SchemaViolation[];
  missingRequired: string[];
  unknownKeys: string[];
}
