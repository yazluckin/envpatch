export interface ExtractOptions {
  keys: string[];
  strict?: boolean; // throw if a requested key is missing
}

export interface ExtractResult {
  extracted: Record<string, string>;
  missing: string[];
  found: string[];
}
