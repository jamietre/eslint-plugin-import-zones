import path from "path";
import { ESLintUtils, TSESLint } from "@typescript-eslint/experimental-utils";
import { ImportZonesOptions, MessageIds } from "../../../types/import-zones-types";
import rule from "../../../import-zones";

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    tsconfigRootDir: path.resolve(__dirname, ".."),
    project: "./tsconfig.test.json", // relative to tsconfigRootDir
  },
});

ruleTester.run("import-zones", rule, {
  valid: [],
  invalid: [
    getInvalidTestCase(
      [
        {
          importPaths: {
            jquery: false,
          },
        },
      ],
      `
        import jquery from "jquery"    // ERROR: import
      `
    ),
  ],
});

/**
 * Instead of hardcoding the line and column numbers of errors, calculate them
 * based on the position of "ERROR: someName" markers in the code.
 */
function getInvalidTestCase(
  options: ImportZonesOptions,
  code: string
): TSESLint.InvalidTestCase<MessageIds, ImportZonesOptions> {
  const lines = code.split(/\r?\n/g);
  const errors = [] as Array<TSESLint.TestCaseError<MessageIds>>;

  lines.forEach((line, i) => {
    const errorInfo = /ERROR: (\w+)/.exec(line);
    if (errorInfo) {
      errors.push({
        line: i + 1,
        column: line.indexOf(errorInfo[1]) + 1,
        messageId: "importIsRestricted",
      });
    }
  });

  if (!errors.length) {
    throw new Error(`Invalid code must have ERROR marker:\n${code}`);
  }

  return {
    code,
    errors,
    filename: "./rules/file.ts",
    options,
  };
}
