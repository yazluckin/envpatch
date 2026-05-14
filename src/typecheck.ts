import { EnvMap } from './parser';
import { TypeCheckRule, TypeCheckResult, TypeCheckViolation, EnvValueType } from './typecheck.types';

function checkType(value: string, type: EnvValueType): { ok: boolean; reason?: string } {
  switch (type) {
    case 'string':
      return { ok: true };
    case 'number':
      return isNaN(Number(value))
        ? { ok: false, reason: `"${value}" is not a valid number` }
        : { ok: true };
    case 'boolean':
      return ['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase())
        ? { ok: true }
        : { ok: false, reason: `"${value}" is not a valid boolean` };
    case 'url':
      try {
        new URL(value);
        return { ok: true };
      } catch {
        return { ok: false, reason: `"${value}" is not a valid URL` };
      }
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? { ok: true }
        : { ok: false, reason: `"${value}" is not a valid email` };
    case 'json':
      try {
        JSON.parse(value);
        return { ok: true };
      } catch {
        return { ok: false, reason: `"${value}" is not valid JSON` };
      }
    default:
      return { ok: true };
  }
}

export function typecheckEnv(env: EnvMap, rules: TypeCheckRule[]): TypeCheckResult {
  const valid: TypeCheckViolation[] = [];
  const invalid: TypeCheckViolation[] = [];
  const missing: string[] = [];

  for (const rule of rules) {
    const value = env[rule.key];
    if (value === undefined) {
      missing.push(rule.key);
      continue;
    }
    const result = checkType(value, rule.expectedType);
    const entry: TypeCheckViolation = {
      key: rule.key,
      value,
      expectedType: rule.expectedType,
      reason: result.reason ?? '',
    };
    if (result.ok) {
      valid.push(entry);
    } else {
      invalid.push(entry);
    }
  }

  return { valid, invalid, missing };
}

export function formatTypecheckSummary(result: TypeCheckResult): string {
  const lines: string[] = [];
  if (result.invalid.length > 0) {
    lines.push('Type errors:');
    for (const v of result.invalid) {
      lines.push(`  [${v.expectedType}] ${v.key}: ${v.reason}`);
    }
  }
  if (result.missing.length > 0) {
    lines.push('Missing keys:');
    for (const k of result.missing) {
      lines.push(`  ${k}`);
    }
  }
  if (result.invalid.length === 0 && result.missing.length === 0) {
    lines.push(`All ${result.valid.length} checked key(s) passed type validation.`);
  }
  return lines.join('\n');
}
