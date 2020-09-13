import { PathMapper } from "../util/path-mapper";
import { getSimplePathMatcher } from "../util/match-path";

describe("PathMapper", () => {
  const modulePath = "./packages/app/src/util/";

  function getPaths() {
    return {
      "common/*": "./packages/common/src/*",
      "app/*": "./packages/app/src/*",
    };
  }
  const pathMatcher = getSimplePathMatcher(getPaths());

  it("leaves modules alone", () => {
    const mapper = new PathMapper({ pathMatcher });
    expect(mapper.getPathFromRoot(modulePath, "abc")).toBe("abc");
  });
  it("works with simple relative paths", () => {
    const mapper = new PathMapper({ pathMatcher });
    expect(mapper.getPathFromRoot(modulePath, "./foo.ts")).toBe("./packages/app/src/util/foo.ts");
    expect(mapper.getPathFromRoot(modulePath, "../foo.ts")).toBe("./packages/app/src/foo.ts");
  });
  it("works with mapped paths", () => {
    const mapper = new PathMapper({ pathMatcher });
    expect(mapper.getPathFromRoot(modulePath, "common/foo.ts")).toBe(
      "./packages/common/src/foo.ts"
    );
    expect(mapper.getPathFromRoot(modulePath, "app/util/bar.ts")).toBe(
      "./packages/app/src/util/bar.ts"
    );
  });
});
