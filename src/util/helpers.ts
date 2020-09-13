export function slash(p: string): string {
  return p.replace(/\\/g, "/");
}

/**
 * Make sure paths start with "./"
 */
export function asRelativePath(text: string) {
  const parsed = isRelativePath(text) ? text : `./${text}`;
  return slash(parsed);
}

export function isRelativePath(text: string): boolean {
  return text.startsWith("./") || text.startsWith("../");
}

export function removeDotPath(text: string): string {
  if (text.startsWith("./")) {
    return text.slice(1);
  }
  return text;
}

const aliasRegex = /(.*)\/\*/;
/**
 * Convert tsconfig paths to simple key: value with a trailing slash
 */
export function parseTsConfigPaths(paths?: {
  [pathPattern: string]: string[];
}): { [key: string]: string } | undefined {
  const out: { [key: string]: string } = {};
  if (!paths) {
    return;
  }
  Object.entries(paths).forEach(([key, value]) => {
    const keyMatch = key.match(aliasRegex);
    // we always just resolve to the first one -- use tsconfig-paths for more
    // sophisticated implementation
    const valueMatch = value[0].match(aliasRegex);

    if (keyMatch != null && valueMatch != null) {
      const alias = keyMatch[1];
      out[`${alias}/`] = slash(valueMatch[1]);
    }
  });
  return out;
}

export function removeDot(text: string): string {
  return text.startsWith("./") ? text.slice(1) : text;
}

export function isRegularObject(obj: any): obj is object {
  if (obj === undefined || obj === null || Array.isArray(obj) || typeof obj !== "object") {
    return false;
  }
  return true;
}

export function assertNever(value: never, errorMessage?: string): never {
  throw new Error(errorMessage || `Unexpected value: ${String(value)}`);
}
