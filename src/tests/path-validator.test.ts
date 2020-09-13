import { getSimplePathMatcher } from "../util/match-path";
import { PathMapper } from "../util/path-mapper";
import { PathValidator, test } from "../util/path-validator";

const { toPathValidationMap, isRuleOutcome, toRuleOutcomes } = test;
describe("PathValidator", () => {
  describe("without path matcher", () => {
    const validator = new PathValidator({
      importPaths: {
        jquery: {
          "**": {
            allowed: false,
            reason: "We don't use jQuery any more",
          },
        },
        moment: {
          allowed: false,
          reason: "Moment mutates its operands",
        },
        leftpad: false,
        "./packages/common/node/**": {
          "./packages/web/**": {
            allowed: false,
            reason: "node utils are not allowed in frontend code",
          },
        },
      },
      zonePaths: {
        "./packages/server/**": {
          react: {
            allowed: false,
            reason: "React is only allowed in frontend code",
          },
        },
        "./packages/web/**": {
          "./packages/server/**": {
            allowed: false,
            reason: "You can't consume the server code from the web",
          },
          "./packages/server/special": {
            allowed: true,
          },
        },
      },
    });

    it("package imports - long form with pattern", () => {
      const error = validator.validate("./packages/app/web/", "jquery");
      expect(error).toMatchInlineSnapshot(`
              Object {
                "importPattern": "jquery",
                "reason": "We don't use jQuery any more",
                "zonePattern": "./packages/app/web/",
              }
          `);
    });

    it("package imports - short form with reason", () => {
      const error = validator.validate("./packages/app/web/", "moment");
      expect(error).toMatchInlineSnapshot(`
        Object {
          "importPattern": "moment",
          "reason": "Moment mutates its operands",
          "zonePattern": "./packages/app/web/",
        }
      `);
    });

    it("package imports - boolean", () => {
      const error = validator.validate("./packages/app/web/", "leftpad");
      expect(error).toMatchInlineSnapshot(`
        Object {
          "importPattern": "leftpad",
          "reason": undefined,
          "zonePattern": "./packages/app/web/",
        }
      `);
    });

    it("package imports - zone pattern", () => {
      const error = validator.validate("./packages/web/components", "../../common/node/");
      expect(error).toMatchInlineSnapshot(`
        Object {
          "importPattern": "./packages/common/node/",
          "reason": "node utils are not allowed in frontend code",
          "zonePattern": "./packages/web/components",
        }
      `);
    });

    it("zonePaths", () => {
      let error = validator.validate("./packages/web/", "../../packages/common/foo");
      expect(error).toBeUndefined();
      error = validator.validate("./packages/web/", "../../packages/server/foo");
      expect(error).toMatchInlineSnapshot(`
        Object {
          "importPattern": "./packages/server/**",
          "reason": "You can't consume the server code from the web",
          "zonePattern": "./packages/web/**",
        }
      `);
    });
    it("zonePaths overridden", () => {
      const error = validator.validate("./packages/web/special/", "./packages/server/foo");
      expect(error).toBeUndefined();
    });
  });

  describe("with path matcher", () => {
    const pathMatcher = getSimplePathMatcher({
      "common/*": "./packages/common/src/*",
      "app/*": "./packages/app/src/*",
      "web/*": "./packages/web/src/*",
      "restricted/*": "./packages/restricted/src/*",
    });
    const pathMapper = new PathMapper({ pathMatcher });
    const validator = new PathValidator({
      pathMapper,

      importPaths: {
        "./packages/restricted/**": {
          "*": {
            allowed: false,
            reason: "This zone is never allowed",
          },
        },
        "./packages/common/src/node/**": {
          "./packages/web/**": {
            allowed: false,
            reason: "You can't import node stuff in the frontend code",
          },
        },
        "./packages/app/**": {
          "./packages/web/**": {
            allowed: false,
            reason: "You can't import the app code in the frontend code",
          },
          "./packages/web/node/**": true,
        },
      },
    });

    it("valid importPath passes", () => {
      // is in allowed zone
      let errors = validator.validate("packages/web/", "web/foo/bar.ts");
      expect(errors).toBeUndefined();

      // same but without path mapping
      errors = validator.validate("packages/web/", "./foo/bar.ts");
      expect(errors).toBeUndefined();

      // doesn't match anything
      errors = validator.validate("packages/foo/", "common/node/bar.ts");
      expect(errors).toBeUndefined();
    });

    it("invalid importPath", () => {
      let errors = validator.validate("packages/web/", "common/node/bar.ts");
      expect(errors).toMatchInlineSnapshot(`
        Object {
          "importPattern": "./packages/common/src/node/bar.ts",
          "reason": "You can't import node stuff in the frontend code",
          "zonePattern": "./packages/web/",
        }
      `);
      errors = validator.validate("packages/web/", "app/foo.ts");

      expect(errors).toMatchInlineSnapshot(`
        Object {
          "importPattern": "./packages/app/src/foo.ts",
          "reason": "You can't import the app code in the frontend code",
          "zonePattern": "./packages/web/",
        }
      `);
    });
    it("forbidden importPath but is overridden by another rule", () => {
      const errors = validator.validate("./packages/web/node/", "app/node/bar.ts");
      expect(errors).toBeUndefined();
    });
  });
});

describe("toPathValidationMap", () => {
  it("converts boolean value", () => {
    expect(
      toPathValidationMap({
        jquery: false,
      })
    ).toMatchInlineSnapshot(`
      Object {
        "jquery": Object {
          "**": Object {
            "allowed": false,
          },
        },
      }
    `);
  });
  it("converts RuleOutcome value", () => {
    expect(
      toPathValidationMap({
        moment: {
          allowed: false,
          reason: "moment mutates its operands which creates silent bugs",
        },
      })
    ).toMatchInlineSnapshot(`
      Object {
        "moment": Object {
          "**": Object {
            "allowed": false,
            "reason": "moment mutates its operands which creates silent bugs",
          },
        },
      }
    `);
  });
});

describe("toRuleOutcomes", () => {
  it("converts boolean", () => {
    expect(
      toRuleOutcomes({
        moment: false,
        foo: {
          allowed: false,
          reason: "foo is not allowed",
        },
      })
    ).toMatchInlineSnapshot(`
      Object {
        "foo": Object {
          "allowed": false,
          "reason": "foo is not allowed",
        },
        "moment": Object {
          "allowed": false,
        },
      }
    `);
  });
});

describe("isRuleOutcome", () => {
  it("detects ruleOutcome structure", () => {
    expect(isRuleOutcome({ allowed: true })).toBe(true);
    expect(isRuleOutcome({ allowed: false })).toBe(true);
    expect(isRuleOutcome({})).toBe(false);
  });
});
