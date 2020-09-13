import path from "path";

import { isRelativePath, asRelativePath } from "./helpers";

type PathMapperOptions = {
  pathMatcher?: (importPath: string) => string | undefined;
};

export class PathMapper {
  private pathMatcher?: (importPath: string) => string | undefined;
  constructor(options: PathMapperOptions = {}) {
    this.pathMatcher = options.pathMatcher;
  }
  /**
   *
   * examples
   *
   * ../util/index => packages/foo/src/util/index
   * foo/util/index => packages/foo/src/util/index
   *
   */

  /**
   * For an import path that is not a module, rewrite it so it's always relative
   * to the project root. If it is an npm package, do nothing.
   */
  getPathFromRoot(modulePath: string, importPath: string): string {
    if (path.isAbsolute(modulePath)) {
      throw new Error(`"${modulePath}" is absolute; it should be relative to the project root.`);
    }
    if (path.isAbsolute(importPath)) {
      throw new Error(
        `"${importPath}" is absolute; absolute paths in "imported" statements are not allowed.`
      );
    }

    if (!isRelativePath(importPath)) {
      if (this.pathMatcher) {
        const parsedPath = this.pathMatcher(importPath);
        if (parsedPath) {
          return parsedPath;
        }
      }
      return importPath;
    }

    // path is relative to module; make it relative to root
    return asRelativePath(path.join(modulePath, importPath));
  }
}
