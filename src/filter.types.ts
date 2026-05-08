export interface FilterOptions {
  keys?: string[];
  pattern?: string | RegExp;
  excludeKeys?: string[];
  excludePattern?: string | RegExp;
  onlyDefined?: boolean;
  onlyEmpty?: boolean;
}

export interface FilterResult {
  kept: Record<string, string>;
  removed: Record<string, string>;
  keptCount: number;
  removedCount: number;
}
