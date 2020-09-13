export type MessageIds = "importIsRestricted";

export type RuleOutcome = { allowed: boolean; reason?: string };

export type ImportZonesOptionsConfig = {
  /**
   * Base URL for the project. If using @typescript-eslint/parser, this will
   * be obtained from tsconfig.json.
   */
  baseUrl?: string;
  /**
   * Aliases that will be used to map import paths. If using
   * @typescript-eslint/parser, this will be obtained from
   * "compilerOptions.paths". The format is
   * {
   *   "alias/": "replace/with/path/"
   * }
   *
   * You don't need to use a trailing slash, but this will prevint
   * indavertently matching against a regular npm packing import.
   */
  paths?: { [alias: string]: string };
  /**
   * For a given import path, validate the path of the module consuming it
   * against a set of rules
   */
  importPaths?: {
    [sourcePath: string]:
      | {
          [targetPaths: string]: boolean | RuleOutcome;
        }
      | boolean
      | RuleOutcome;
  };
  /**
   * For a given module path pattern, validate the path of imports contianed in
   * modules found in locations matching the pattern against a set of rule.
   */
  zonePaths?: {
    [sourcePath: string]: {
      [targetPaths: string]: boolean | RuleOutcome;
    };
  };
};

export type ImportZonesOptions = [ImportZonesOptionsConfig];
