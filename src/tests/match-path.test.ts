import { getSimplePathMatcher, tsConfigStyleToStringReplacer } from "../util/match-path";

describe("match-path", () => {
  const data = {
    "common/*": ["./packages/common/src/*"],
    "app/*": ["./packages/app/src/app.ts"],
    "app2/*": ["packages/app2/src/app.ts"],
    "restricted/*": "./packages/restricted/src/*",
    // only use first element
    jquery: ["node_modules/jquery", ""],
  };

  describe("tsConfigStyleToStringReplacer", () => {
    it("works with variants of tsconfig format", () => {
      expect(tsConfigStyleToStringReplacer(data)).toMatchInlineSnapshot(`
        Array [
          Object {
            "matchType": "wildcard",
            "prefix": "common/",
            "replaceWith": "./packages/common/src/",
          },
          Object {
            "matchType": "wildcard-exact",
            "prefix": "app/",
            "replaceWith": "./packages/app/src/app.ts",
          },
          Object {
            "matchType": "wildcard-exact",
            "prefix": "app2/",
            "replaceWith": "./packages/app2/src/app.ts",
          },
          Object {
            "matchType": "wildcard",
            "prefix": "restricted/",
            "replaceWith": "./packages/restricted/src/",
          },
          Object {
            "matchType": "exact",
            "prefix": "jquery",
            "replaceWith": "./node_modules/jquery",
          },
        ]
      `);
    });
  });

  describe("getSimplePathMatcher", () => {
    const matcher = getSimplePathMatcher(data);
    it("wildcard", () => {
      expect(matcher("common/foo/bar.ts")).toBe("./packages/common/src/foo/bar.ts");
    });
    it("wildcard-exact", () => {
      expect(matcher("app/foo/bar.ts")).toBe("./packages/app/src/app.ts");
      expect(matcher("app/foo/baz/bar.ts")).toBe("./packages/app/src/app.ts");
      expect(matcher("app")).toBeUndefined();
    });
    it("exact", () => {
      expect(matcher("jquery")).toBe("./node_modules/jquery");
      expect(matcher("jquery/foo")).toBeUndefined();
    });
    it("works with full wildcard", () => {
      const wildcardMatcher = getSimplePathMatcher({
        "special/*": "special/out/*",
        "*": "generated/*",
      });
      expect(wildcardMatcher("special/foo")).toBe("./special/out/foo");
      expect(wildcardMatcher("anything-else")).toBe("./generated/anything-else");
    });
  });
});
