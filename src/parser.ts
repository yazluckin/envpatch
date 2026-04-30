export type EnvMap = Record<string, string>;

/**
 * Parses the contents of a .env file into a key-value map.
 * Supports:
 *  - KEY=VALUE
 *  - KEY="VALUE" or KEY='VALUE'
 *  - # comments
 *  - blank lines
 */
export function parseEnv(content: string): EnvMap {
  const result: EnvMap = {};

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();

    // Skip blank lines and comments
    if (!line || line.startsWith('#')) continue;

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if (!key) continue;

    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

/**
 * Serializes an EnvMap back to .env file format.
 * Keys are sorted alphabetically for deterministic output.
 */
export function serializeEnv(map: EnvMap): string {
  return (
    Object.keys(map)
      .sort()
      .map((key) => {
        const value = map[key];
        // Quote values that contain spaces or special characters
        const needsQuotes = /[\s#"'\\]/.test(value) || value === '';
        const serializedValue = needsQuotes ? `"${value}"` : value;
        return `${key}=${serializedValue}`;
      })
      .join('\n') + '\n'
  );
}
