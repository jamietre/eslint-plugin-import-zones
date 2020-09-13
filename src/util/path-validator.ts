import path from "path";
import micromatch from "micromatch";

import { PathMapper } from "./path-mapper";
import { asRelativePath, removeDot } from "./helpers";
import { ImportZonesOptions, RuleOutcome } from "../types/import-zones-types";

export type PathValidationMap = {
  [sourcePath: string]: {
    [targetPaths: string]: RuleOutcome;
  };
};

export type PathValidatorOptions = Pick<ImportZonesOptions[0], "importPaths" | "zonePaths"> & {
  pathMapper?: PathMapper;
};

export type ValidationError = {
  importPattern: string;
  zonePattern: string;
  reason?: string;
};

export type RuleError = {
  sourcePath: string;
  sourcePattern: string;
  targetPath: string;
  targetPattern: string;
  reason?: string;
};

export class PathValidator {
  private pathMapper: PathMapper;
  private importPaths?: PathValidationMap;
  private zonePaths?: PathValidationMap;
  constructor(options: PathValidatorOptions) {
    const { pathMapper, importPaths, zonePaths } = options;
    this.pathMapper = pathMapper || new PathMapper();
    this.importPaths = importPaths && toPathValidationMap(importPaths);
    this.zonePaths = zonePaths && toPathValidationMap(zonePaths);
  }

  validate(modulePathRelative: string, importPath: string): ValidationError | undefined {
    if (path.isAbsolute(modulePathRelative)) {
      throw new Error(
        `"${modulePathRelative}" is absolute; it should be relative to the project root.`
      );
    }
    if (path.isAbsolute(importPath)) {
      throw new Error(`"${importPath}" is absolute; imported modules cannot be absolute.`);
    }

    const { importPaths, zonePaths, pathMapper } = this;
    const modulePathClean = asRelativePath(modulePathRelative);
    const importPathClean = pathMapper.getPathFromRoot(modulePathClean, importPath);

    if (importPaths) {
      const error = validateMap(importPathClean, modulePathClean, importPaths);
      if (error) {
        const out: ValidationError = {
          importPattern: error.sourcePath,
          zonePattern: error.targetPath,
          reason: error.reason,
        };
        return out;
      }
    }
    if (zonePaths) {
      const error = validateMap(modulePathClean, importPathClean, zonePaths);
      if (error) {
        const out: ValidationError = {
          importPattern: error.targetPattern,
          zonePattern: error.sourcePattern,
          reason: error.reason,
        };
        return out;
      }
    }
    return undefined;
  }
}

function validateMap(
  sourcePath: string,
  targetPath: string,
  map: PathValidationMap
): RuleError | undefined {
  const entries = Object.entries(map);
  for (let j = 0; j < entries.length; j++) {
    const [sourcePattern, rulesMap] = entries[j];
    if (match(sourcePath, sourcePattern)) {
      let isValid: boolean = false;
      let ruleError: RuleError | undefined;

      const rules = Object.entries(rulesMap);
      for (let i = 0; i < rules.length; i++) {
        const [targetPattern, outcome] = rules[i];
        if (match(targetPath, targetPattern)) {
          // explicit "true" rules always supercede anything else for a pattern
          if (outcome.allowed) {
            isValid = true;
            break;
          }

          // if there's more than one problem (which is possible with
          // overlapping targets) just return the first one
          if (!ruleError)
            ruleError = {
              sourcePath,
              targetPath,
              sourcePattern,
              targetPattern,
              reason: outcome.reason,
            };
        }
      }
      // any rule failure makes in import invalid; even if there's another
      // config that seems to explicity make it valid as an override within that
      // config. The override only appies to that node: another failure in
      // another node invalidates it.
      if (!isValid) {
        return ruleError;
      }
    }
  }
  return undefined;
}

function match(target: string, pattern: string): boolean {
  return micromatch.isMatch(removeDot(target), removeDot(pattern));
}

/**
 * For "importPaths" we allow the target to just be bool or { allowed, reason }
 * since you might just want to completely ban an import. This syntax allows
 * shorthand to do that versus using a "**": { ...  } configuration. This maps
 * to the long format.
 */
function toPathValidationMap(config: {
  [sourcePath: string]:
    | {
        [targetPaths: string]: boolean | RuleOutcome;
      }
    | boolean
    | RuleOutcome;
}): PathValidationMap {
  const out: PathValidationMap = {};
  const entries = Object.entries(config);
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    if (typeof value === "boolean" || isRuleOutcome(value)) {
      out[key] = {
        "**": asRuleOutcome(value),
      };
    } else {
      out[key] = toRuleOutcomes(value);
    }
  }
  return out;
}

function toRuleOutcomes(node: {
  [key: string]: boolean | RuleOutcome;
}): { [key: string]: RuleOutcome } {
  const out: { [key: string]: RuleOutcome } = {};
  const entries = Object.entries(node);
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    out[key] = asRuleOutcome(value);
  }
  return out;
}

function isRuleOutcome(obj: { [key: string]: unknown } | RuleOutcome): obj is RuleOutcome {
  return obj && typeof obj.allowed === "boolean";
}

function asRuleOutcome(obj: boolean | RuleOutcome): RuleOutcome {
  if (typeof obj === "boolean") {
    return {
      allowed: obj,
    };
  }
  return obj;
}

export const test = { toPathValidationMap, toRuleOutcomes, isRuleOutcome };
