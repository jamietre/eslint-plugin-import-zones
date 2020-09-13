/* eslint-disable no-console */

import path from "path";
import { JSONSchema4 } from "json-schema";
import { ESLintUtils, TSESTree } from "@typescript-eslint/experimental-utils";

import { PathMapper } from "./util/path-mapper";
import { PathValidator } from "./util/path-validator";
import { getSimplePathMatcher, getNullPathMatcher } from "./util/match-path";
import { ImportZonesOptions, MessageIds } from "./types/import-zones-types";

import optionsSchemaJson from "./types/import-zones-options-schema.json";

const optionsSchema: JSONSchema4 = optionsSchemaJson as JSONSchema4;

// const importZoneOptionsSchema = optionsSchemaJson.definitions.ImportZonesOptions;
// const outcome = optionsSchemaJson.definitions.RuleOutcome;
// const schema: JsonSchema4 =

const createRule = ESLintUtils.RuleCreator(
  () => "https://github.com/jamietre/eslint-plugin-import-zones"
);
const ruleName = "import-zones";

export default createRule<ImportZonesOptions, MessageIds>({
  name: ruleName,
  meta: {
    type: "problem",
    docs: {
      description: "Import is restricted.",
      category: "Best Practices",
      recommended: "error",
      requiresTypeChecking: false,
    },
    messages: {
      importIsRestricted: "'{{path}}' is not allowed to be imported by modules in {{zone}}",
    },
    schema: [optionsSchema],
  },
  defaultOptions: [{}],
  create(context) {
    const { parserServices, options } = context;
    let { baseUrl } = options[0];
    const { paths, importPaths, zonePaths } = options[0];

    // If ts parser is available, then try to get baseUrl & paths from tsconfig compiler
    // options (if not specified explicitly.)

    if (parserServices) {
      const compilerOptions = parserServices.program.getCompilerOptions();

      baseUrl = baseUrl || compilerOptions.baseUrl;
      if (!paths && compilerOptions.paths) {
        if (!baseUrl) {
          throw new Error(
            `${ruleName} requires baseUrl to be provided, or set in tsconfig when @typescript/eslint parser is used, and paths are not provided.`
          );
        }
      }
    }

    const pathMatcher = paths ? getSimplePathMatcher(paths) : getNullPathMatcher();
    if (!baseUrl) {
      throw new Error(`${ruleName} requires baseUrl to be provided.`);
    }

    const rootUrl = baseUrl;

    const pathMapper = new PathMapper({ pathMatcher });
    const validator = new PathValidator({
      pathMapper,
      importPaths,
      zonePaths,
    });

    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration): void {
        const fileName = context.getFilename();
        const modulePath = path.isAbsolute(fileName)
          ? path.relative(rootUrl, context.getFilename())
          : fileName;
        const importPath = node.source.value as string;
        const error = validator.validate(modulePath, importPath);
        if (error) {
          context.report({
            node,
            messageId: "importIsRestricted",
            data: {
              path: error.importPattern,
              zone: error.zonePattern,
            },
          });
        }
      },
    };
  },
});
