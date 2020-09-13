// https://jestjs.io/docs/en/configuration.html
module.exports = {
  preset: "ts-jest",
  automock: false,
  roots: ["<rootDir>/src/tests"],
  testEnvironment: "node",
  testRegex: ["(/__tests__/.*|(\\.|/)test)\\.[jt]sx?$"],
};
