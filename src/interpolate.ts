import { EnvMap } from './snapshot.types';

export interface InterpolateOptions {
  allowMissing?: boolean;
  prefix?: string;
  suffix?: string;
}

export interface InterpolateResult {
  env: EnvMap;
  resolved: string[];
  missing: string[];
  circular: string[];
}

/**
 * Resolve ${VAR} references within env values using other keys in the same map.
 */
export function interpolateEnv(
  env: EnvMap,
  options: InterpolateOptions = {}
): InterpolateResult {
  const { allowMissing = false, prefix = '${', suffix = '}' } = options;
  const resolved: string[] = [];
  const missing: string[] = [];
  const circular: string[] = [];

  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `${escape(prefix)}([A-Za-z_][A-Za-z0-9_]*)${escape(suffix)}`,
    'g'
  );

  const resolving = new Set<string>();

  function resolve(key: string, visited: Set<string>): string {
    const raw = env[key];
    if (raw === undefined) return prefix + key + suffix;

    if (visited.has(key)) {
      if (!circular.includes(key)) circular.push(key);
      return raw;
    }

    visited.add(key);
    const result = raw.replace(pattern, (_match, ref: string) => {
      if (!(ref in env)) {
        if (!missing.includes(ref)) missing.push(ref);
        if (!allowMissing) throw new Error(`Missing env variable: ${ref}`);
        return prefix + ref + suffix;
      }
      if (!resolved.includes(ref)) resolved.push(ref);
      return resolve(ref, new Set(visited));
    });
    visited.delete(key);
    return result;
  }

  const output: EnvMap = {};
  for (const key of Object.keys(env)) {
    try {
      output[key] = resolve(key, resolving);
    } catch {
      output[key] = env[key];
    }
  }

  return { env: output, resolved, missing, circular };
}

export function formatInterpolateSummary(result: InterpolateResult): string {
  const lines: string[] = [];
  if (result.resolved.length > 0)
    lines.push(`Resolved references: ${result.resolved.join(', ')}`);
  if (result.missing.length > 0)
    lines.push(`Missing references: ${result.missing.join(', ')}`);
  if (result.circular.length > 0)
    lines.push(`Circular references: ${result.circular.join(', ')}`);
  if (lines.length === 0) lines.push('No interpolation needed.');
  return lines.join('\n');
}
