module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: ["eslint-config-airbnb-base", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      generators: false,
      objectLiteralDuplicateProperties: false,
    },
    ecmaVersion: 2018,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint", "no-only-tests", "import"],
  rules: {
    quotes: [
      "error",
      "double",
      {
        avoidEscape: true,
      },
    ],
    "import/no-cycle": [2, { ignoreExternal: true }],
    "import/named": 2,
    "import/extensions": 0,
    "import/no-unresolved": 0,
    "import/no-extraneous-dependencies": 0,
    "import/prefer-default-export": 0,
    "import/extenstions": 0,
    "no-only-tests/no-only-tests": 2,
    "no-unused-expressions": [
      "error",
      {
        allowShortCircuit: true,
        allowTernary: false,
        allowTaggedTemplates: false,
      },
    ],
    "@typescript-eslint/no-floating-promises": 2,
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/array-type": [
      2,
      {
        default: "array-simple",
      },
    ],
    "@typescript-eslint/consistent-type-assertions": [
      2,
      {
        assertionStyle: "as",
        objectLiteralTypeAssertions: "allow-as-parameter",
      },
    ],
    "@typescript-eslint/await-thenable": [2],
    "@typescript-eslint/require-await": [2],
    "@typescript-eslint/return-await": [2],
    "@typescript-eslint/no-misused-promises": [2],
    "@typescript-eslint/promise-function-async": [2],
    "@typescript-eslint/no-useless-constructor": ["error"],
    "@typescript-eslint/no-empty-function": ["error"],
    "@typescript-eslint/no-floating-promises": [0],
    // where we disagre with airbnb
    "lines-between-class-members": 0,
    "no-plusplus": 0,
    "no-use-before-define": 0,
    "consistent-return": 0,
    "no-param-reassign": 0,
    "no-continue": 0,
    // redundant with typescript
    "no-unused-vars": 0,
    "no-undef": 0,
    "react/prop-types": 0,
    "consistent-return": 0,
    "no-useless-return": 0,
    "symbol-description": 0,
    "import/extensions": 0,
    "import/no-unresolved": 0,
    "import/no-extraneous-dependencies": 0,
    "import/prefer-default-export": 0,
    "no-dupe-class-members": 0,
  },
  ignorePatterns: [
    ".*",
    "babel.config.js",
    "jest.config.js",
    "node_modules/",
    "dist/",
    ".history/",
  ],
};
