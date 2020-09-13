/* eslint-disable no-console */

/**
 * This will generate a JSON 7 schema for the option types, however, it cannot
 * be used directly with eslint plugin because it seems to only accept JSON
 * Schema v4. For now this is useful for doing most of the work, we can make it
 * work with eslint by de-referencing the definitions created by the schema
 * generator by hand. This could be automated completely with a bit more work,
 * or maybe there's some other tool better suited for this. For now this is not
 * part of the actual build but just a dev tool if the options schema changes.
 */

import path from "path";
import fs from "fs";
import { createGenerator, Config } from "ts-json-schema-generator";

const generate = process.argv[2] === "--generate";

// todo: this is brittle, better way to find root
const projectRoot = path.join(__dirname, "../..");
const schemaFileName = "import-zones-options-schema.json";
const schemaPath = path.join(projectRoot, "src", "types", schemaFileName);

const tsjConfig: Config = {
  path: path.resolve(projectRoot, "types/import-zones-types.ts"),
  tsconfig: path.resolve(projectRoot, "tsconfig.json"),
  type: "ImportZonesOptions",
  expose: "export",
  jsDoc: "extended",
  topRef: false,
  skipTypeCheck: true,
};

const schema = createGenerator(tsjConfig).createSchema(tsjConfig.type) as any;

if (!generate) {
  let existing = "";
  try {
    existing = fs.readFileSync(schemaPath, "utf-8");
  } catch (e) {
    /** noop */
  }

  delete schema.definitions;
  const generated = JSON.stringify(schema, null, 2);
  if (generated !== existing) {
    console.error("Options JSON schema needs to be regenerated; rerun with --generate");
    process.exit(1);
  }
  process.exit(0);
}

fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2), "utf-8");
