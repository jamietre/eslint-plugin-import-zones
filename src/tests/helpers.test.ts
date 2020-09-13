import { parseTsConfigPaths } from "../util/helpers";

describe("helpers", () => {
  it("parseTsConfigPaths", () => {
    const data = {
      "common/*": ["./packages/common/src/*"],
      "app/*": ["./packages/app/src/*"],
      "web/*": ["./packages/web/src/*", ""],
      "restricted/*": ["./packages/restricted/src/*"],
    };
    expect(parseTsConfigPaths(data)).toStrictEqual({
      "common/": "./packages/common/src",
      "app/": "./packages/app/src",
      "web/": "./packages/web/src",
      "restricted/": "./packages/restricted/src",
    });
  });
});
