import { describe, it, expect, beforeAll } from "bun:test";
import { Org } from "@salesforce/core";
import type { Connection } from "@salesforce/core";
import { getFeatures, loadFeatureModules, runExport } from "../src/features.ts";
import { Context } from "../src/index.ts";

const modules = loadFeatureModules();
const featureIds = modules.map(({ name }) => name);
const featureIdsWithMods = modules.map(({ name, mod }) => ({ id: name, mod }));

describe("detects the feature in a Scratch Org when enabled", () => {
  let conn: Connection;
  let ctx: Context;

  beforeAll(async () => {
    const org = await Org.create({ aliasOrUsername: "enterprise-features" });
    conn = org.getConnection();
    ctx = await runExport(conn);
  });

  for (const id of featureIds) {
    it(id, async () => {
      const detectedFeatures = await getFeatures(conn, ctx);
      expect(detectedFeatures.map((f) => f.toLowerCase())).toContain(id.split("_")[1]);
    });
  }
});

describe("does not detect the feature in a Scratch Org without any features enabled", () => {
  let enterprise: Connection;
  let developer: Connection;
  let enterpriseCtx: Context;
  let developerCtx: Context;

  beforeAll(async () => {
    enterprise = (await Org.create({ aliasOrUsername: "enterprise-no-features" })).getConnection();
    developer = (await Org.create({ aliasOrUsername: "developer-no-features" })).getConnection();
    enterpriseCtx = await runExport(enterprise);
    developerCtx = await runExport(developer);
  });

  for (const { id, mod } of featureIdsWithMods) {
    const testFn = mod.default.skipNoFeatures ? it.skip : it;
    testFn(id, async () => {
      const lowercaseFeature = id.split("_")[1];
      const detectedFeaturesEnterprise = (await getFeatures(enterprise, enterpriseCtx)).map((f) =>
        f.toLowerCase(),
      );
      const detectedFeaturesDeveloper = (await getFeatures(developer, developerCtx)).map((f) =>
        f.toLowerCase(),
      );
      const atLeastOneOrgDoesNotHaveTheFeatureEnabled =
        !detectedFeaturesEnterprise.includes(lowercaseFeature) ||
        !detectedFeaturesDeveloper.includes(lowercaseFeature);
      expect(atLeastOneOrgDoesNotHaveTheFeatureEnabled).toBeTrue();
    });
  }
});
