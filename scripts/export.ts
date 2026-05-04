#!/usr/bin/env bun
/// <reference types="bun" />

import { Org } from "@salesforce/core";
import { runExport } from "../src/features";
import { getObjectSettings, getSettings } from "../src/settings.ts";

const aliases = [
  "developer-no-features",
  "developer-features",
  "enterprise-no-features",
  "enterprise-features",
] as const;

for (const alias of aliases) {
  const org = await Org.create({ aliasOrUsername: alias });
  const conn = org.getConnection();
  const result = await runExport(conn);
  await Bun.write(`data/settings/${alias}.json`, JSON.stringify(result, null, 2));
  const settings = await getSettings(conn);
  const sortedSettings = Object.fromEntries(
    Object.entries(settings).sort(([a], [b]) => a.localeCompare(b)),
  );
  await Bun.write(`data/settings/${alias}.settings.json`, JSON.stringify(sortedSettings, null, 2));
  const objjectSettings = await getObjectSettings(conn);
  await Bun.write(
    `data/settings/${alias}.object-settings.json`,
    JSON.stringify(objjectSettings, null, 2),
  );
}
