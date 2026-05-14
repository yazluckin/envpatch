export type EnvValueType = 'string' | 'number' | 'boolean' | 'url' | 'email' | 'json';

export interface TypeCheckRule {
  key: string;
  expectedType: EnvValueType;
}

export interface TypeCheckViolation {
  key: string;
  value: string;
  expectedType: EnvValueType;
  reason: string;
}

export interface TypeCheckResult {
  valid: TypeCheckViolation[];
  invalid: TypeCheckViolation[];
  missing: string[];
}
