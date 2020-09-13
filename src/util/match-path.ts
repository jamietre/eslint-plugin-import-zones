import { slash, assertNever, asRelativePath } from "./helpers";

export interface PathMatcher {
  (importPath: string): string | undefined;
}

const wildcardRegex = /^(.*)\*$/;

type StringReplacer = {
  matchType: "wildcard" | "exact" | "wildcard-exact";
  prefix: string;
  replaceWith: string;
};

/**
 * Convert a tsconfig paths-style pattern map to an array of StringReplacer
 */
export function tsConfigStyleToStringReplacer(paths: {
  [key: string]: string | string[];
}): StringReplacer[] {
  return Object.entries(paths).reduce((acc, [key, valueObj]) => {
    const value = Array.isArray(valueObj) ? valueObj[0] : valueObj;
    const matches = key.match(wildcardRegex);
    const replaceMatches = value.match(wildcardRegex);
    const isWildcard = matches && matches.length > 1;
    const isWildcardTarget = replaceMatches && replaceMatches.length > 1;
    if (isWildcard) {
      acc.push({
        matchType: isWildcardTarget ? "wildcard" : "wildcard-exact",
        prefix: slash(matches![1]),
        replaceWith: asRelativePath(slash(isWildcardTarget ? replaceMatches![1] : value)),
      });
    } else {
      acc.push({
        matchType: "exact",
        prefix: slash(key),
        replaceWith: asRelativePath(slash(value)),
      });
    }
    return acc;
  }, [] as StringReplacer[]);
}

/**
 * Matcher with basic pattern matching:
 *
 * {
 *   "foo/*"": "foo/bar/*"     foo/baz => foo/bar/baz
 *   "foo": "foo-bar"          foo => foo/bar (exacc matches only)
 * }
 */
export function getSimplePathMatcher(paths?: {
  [key: string]: string | string[];
}): (importPath: string) => string | undefined {
  if (!paths) {
    return getNullPathMatcher();
  }
  const stringReplacers = tsConfigStyleToStringReplacer(paths);

  return (importPath: string) => {
    let replaced: string | undefined;
    for (let i = 0; i < stringReplacers.length; i++) {
      const replacer = stringReplacers[i];

      switch (replacer.matchType) {
        case "wildcard":
          if (importPath.startsWith(replacer.prefix)) {
            return slash(`${replacer.replaceWith}${importPath.slice(replacer.prefix.length)}`);
          }
          break;
        case "wildcard-exact":
          if (importPath.startsWith(replacer.prefix)) {
            return replacer.replaceWith;
          }
          break;
        case "exact":
          if (importPath === replacer.prefix) {
            return replacer.replaceWith;
          }
          break;
        default:
          assertNever(replacer.matchType);
      }
    }
    return replaced;
  };
}

export function getNullPathMatcher() {
  return (_importPath: string) => {
    return undefined;
  };
}
