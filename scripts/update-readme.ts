#!/usr/bin/env bun
export {};

import { globSync } from "node:fs";
import { basename } from "node:path";

const BASE_URL =
  "https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_def_file_config_values.htm";

interface Feature {
  id: string;
  name: string;
}

const features: Feature[] = JSON.parse(await Bun.file("data/features.json").text());

const implementedIds = new Set(globSync("src/features/*.ts").map((f) => basename(f, ".ts")));

const implemented = features.filter((f) => implementedIds.has(f.id));
const lines = implemented.map((f) => `- [${f.name}](${BASE_URL}#${f.id})`);

const content = [
  `${implemented.length}/${features.length} features implemented`,
  "",
  ...lines,
].join("\n");

const readme = await Bun.file("README.md").text();
const updated = readme.replace(
  /(<!--features-start-->)\n*[\s\S]*?\n*(<!--features-end-->)/,
  `$1\n\n${content}\n\n$2`,
);
await Bun.file("README.md").write(updated);
console.log(`Updated README.md: ${implemented.length}/${features.length} features`);
