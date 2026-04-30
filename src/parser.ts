/**
 * Parses .env file content into a key-value map.
 * Handles comments, blank lines, quoted values, and inline comments.
 */

export type EnvMap = Map<string, string>;

const LINE_REGEX = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/;
const COMMENT_REGEX = /^\s*#/;

/**
 * Parse raw .env file content into an EnvMap.
 */
export function parseEnv(content: string): EnvMap {
  const map: EnvMap = new Map();
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim() || COMMENT_REGEX.test(line)) {
      continue;
    }

    const match = LINE_REGEX.exec(line);
    if (!match) {
      continue;
    }

    const key = match[1];
    let value = match[2];

    // Strip surrounding quotes (single or double)
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    } else {
      // Strip inline comments for unquoted values
      const inlineComment = value.indexOf(' #');
      if (inlineComment !== -1) {
        value = value.slice(0, inlineComment).trimEnd();
      }
    }

    map.set(key, value);
  }

  return map;
}

/**
 * Serialize an EnvMap back to .env file content.
 */
export function serializeEnv(map: EnvMap): string {
  const lines: string[] = [];
  for (const [key, value] of map.entries()) {
    const needsQuotes = /\s|#|'|"/.test(value);
    const serializedValue = needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value;
    lines.push(`${key}=${serializedValue}`);
  }
  return lines.join('\n') + (lines.length > 0 ? '\n' : '');
}
