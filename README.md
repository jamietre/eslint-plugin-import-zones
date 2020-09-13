# eslint-plugin-import-zones

[![Build Status](https://travis-ci.org/jamietre/eslint-plugin-import-zones.svg?branch=master)](https://travis-ci.org/gund/eslint-plugin-import-zones)
[![Npm](https://img.shields.io/npm/v/eslint-plugin-import-zones.svg)](https://www.npmjs.com/package/eslint-import-zones)
[![Npm Downloads](https://img.shields.io/npm/dt/eslint-plugin-import-zones.svg)](https://www.npmjs.com/package/eslint-plugin-import-zones)
![Size](https://badgen.net/bundlephobia/minzip/eslint-plugin-import-zones)
[![Licence](https://img.shields.io/npm/l/eslint-plugin-import-zones.svg?maxAge=2592000)](https://github.com/jamietre/eslint-plugin-import-zones/blob/master/LICENSE)

> ESLint rule that allows forbidding imports based on zones in your codebase

## Overview

The "import-zones" plugin allows you to define zones using glob patterns from which imports aren't
allowed. The configuration can be used to prevent anything within a zone from being _imported by_
other specific targets; or the reverse, meaning you can prevent anything within a zone from
_importing_ other targets.

## Prerequisites

This plugin doesn't require typescript, but if you're using it, you should install
`@typescript-eslint/parser`. When using with TypeScript, including the parser will automatically
configure use of `paths` from your tsconfig.json to resolve aliases correctly.

See "TypeScript Configuration" at the end for use with the parser.

## Install

Install the plugin

_Note: Not published yet! If you want, try consume as a git repo_

## Setup

Add import-zones plugin and rule to your `.eslintrc`, for example:

```javascript .eslint.js
module.exports = {
  "plugins": ["import-zones", ...],
  "rules": {
    "import-zones/import-zones": ["error", {
        "baseUrl": __dirname,
        "paths": {
          "web/*": "packages/web/*",
          "app/*": "packages/app/*"
        },
        importPaths: {
          "react": {
             "./packages/app/**": {
               allowed: false,
               reason: "No react in the server code"
             }
          }
        },
        zonePaths: {
          "./packages/web/**": {
             "express": false,
             "moment": {
               allowed: "false",
               reason: "moment mutates its operands leading to confusing bugs"
             }
          }
        }
    }]
  }
}
```

With typescript, it's recommended to use `@typescript-eslint/parser`, e.g. additional configuration;

```jsonc
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "project": "./tsconfig.json"
  }
```

## Configuration

Configuration has four properties:

- "baseUrl" must be an absolute URL to the root of your project. If you're using
  @typescript-eslint/parser, this will be obtained from your tsconfig.json, if present there.
- "paths" is a map that transforms import targets using logic similar to that of tsconfig compiler
  option "paths". See "Paths" below.
- "importPaths" contains patterns that are matched against each import. If a pattern matches, then
  the rules for that node area applied to determine if it is allowed.
- "zonePaths" contains patterns that are matched against the location of the module itself. If a
  pattern matches, then the rules for that node are applied to each import in the module to see if
  it is allowed.

The keys of "importPaths" can match paths relative to `baseUrl` within your project; or npm package
names. The keys of "zonePaths" should only match paths within your project. It doesn't make sense to
ban an import within some npm package!

The aliases you provide in "paths" are use to transform the target of an `import` statement... not
your rules. You must use real paths in the `importPaths` and `zonePaths` configuration!

`importPaths` and `zonePaths` both accept the following structure:

```typescript
{
  "pattern1": {
    "pattern2": boolean |
      {
        allowed: boolean,
        reason?: string
      } |
    boolean |
    {
      allowed: boolean,
      reason?: string
    }
  }
}
```

Examples:

```jsonc
{
  "importPaths": {
    // jquery is never allowed
    "jquery": false,
    // matches only import statements from within src/server
    "./src/server/**": {
      // code within ./src/server cannot be imported by modules under ./src/web
      "./src/web/**": false,
      // forbid anything in "server" from importing code in this subdirectory
      "./src/server/auth/**": {
        "allowed": false,
        "reason": "this should only be imported by middleware"
      },
      // override to previous rule
      "./src/server/middleware/**": true,
      // exception to rule above
      "./src/web/shared/**": true
    }
  },
  "zonePaths": {
    // matches only modules appearing within src/srver
    "./src/server/**": {
      // react is never allowed within ./src/server/, and reason is provided
      "react": {
        "allowed": false,
        "reason": "react is only for frontend code"
      }
    }
  }
}
```

## Paths

The "paths" option roughly works like the TypeScript compiler option:
https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping

-- all alias targets are relative to baseUrl -- The wildcard _ should only appear as the last
character of either a pattern or a target; it will be treated like a normal character in any other
position. -- Aliases are evaluated in the order they appear; so a single wildcard "_" will match
anything an all patterns after that would be ignored.

###

## TypeScript Configuration

To use `@typescript/eslint-parser`, add development dependencies:

- `@typescript-eslint/parser`
- `typescript`

Configure ESLint:

```jsonc
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module",
    "project": "./tsconfig.json"
  }
}
```
