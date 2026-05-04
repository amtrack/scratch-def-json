import { ExecuteService } from "@salesforce/apex-node";
import type { Connection } from "@salesforce/core";
import type { Context } from ".";

import so_communities from "./features/so_communities";
import so_contactstomultipleaccounts from "./features/so_contactstomultipleaccounts";
import so_cpq from "./features/so_cpq";
import so_knowledge from "./features/so_knowledge";
import so_personaccounts from "./features/so_personaccounts";
import so_servicecloud from "./features/so_servicecloud";
import so_sharedactivities from "./features/so_sharedactivities";
import so_sites from "./features/so_sites";
import so_socialcustomerservice from "./features/so_socialcustomerservice";
import so_stateandcountrypicklist from "./features/so_stateandcountrypicklist";

type FeatureModule = {
  default:
    | { anonymousApex: string; skipNoFeatures?: boolean }
    | {
        check: (conn: Connection, ctx: Context) => Promise<string | undefined>;
        skipNoFeatures?: boolean;
      };
};

const featureModules: { name: string; mod: FeatureModule }[] = [
  { name: "so_communities", mod: { default: so_communities } },
  {
    name: "so_contactstomultipleaccounts",
    mod: { default: so_contactstomultipleaccounts },
  },
  { name: "so_cpq", mod: { default: so_cpq } },
  { name: "so_knowledge", mod: { default: so_knowledge } },
  { name: "so_personaccounts", mod: { default: so_personaccounts } },
  { name: "so_servicecloud", mod: { default: so_servicecloud } },
  { name: "so_sharedactivities", mod: { default: so_sharedactivities } },
  { name: "so_sites", mod: { default: so_sites } },
  {
    name: "so_socialcustomerservice",
    mod: { default: so_socialcustomerservice },
  },
  {
    name: "so_stateandcountrypicklist",
    mod: { default: so_stateandcountrypicklist },
  },
];

export function loadFeatureModules() {
  return featureModules;
}

function generateAnonymousApex(): string {
  const modules = loadFeatureModules();

  const methodNames: string[] = [];
  const methodBodies: string[] = [];

  for (const { name, mod } of modules) {
    if (!("anonymousApex" in mod.default)) {
      continue;
    }
    const methodName = name;
    methodNames.push(methodName);
    methodBodies.push(indent(mod.default.anonymousApex.trim(), "  "));
  }

  const calls = methodNames.map((name) => `this.${name}()`).join(", ");
  const methods = methodBodies.join("\n\n");

  return `class FeatureDetector {
  List<String> detect() {
    List<String> features = new List<String>();
    for (String feature : new List<String>{${calls}}) {
      if (feature != null) {
        features.add(feature);
      }
    }
    return features;
  }

${methods}
}

FeatureDetector detector = new FeatureDetector();
List<String> features = detector.detect();
System.debug(JSON.serialize(features));`;
}

function indent(code: string, prefix: string): string {
  return code
    .split("\n")
    .map((line) => (line.trim() ? prefix + line : line))
    .join("\n");
}

export async function getFeatures(conn: Connection, ctx: Context): Promise<string[]> {
  const modules = loadFeatureModules();

  // call check functions directly
  const checkResults = await Promise.all(
    modules
      .filter(({ mod }) => "check" in mod.default)
      .map(({ mod }) => {
        const { check } = mod.default as {
          check: (conn: Connection, ctx: Context) => Promise<string | undefined>;
        };
        return check(conn, ctx);
      }),
  );
  const checkFeatures = checkResults.filter((result): result is string => result != null);

  // execute anonymous apex for the rest
  const hasApexModules = modules.some(({ mod }) => "anonymousApex" in mod.default);
  if (!hasApexModules) {
    return checkFeatures.sort();
  }
  let result;
  const anonymousApex = generateAnonymousApex();
  try {
    const exec = new ExecuteService(conn);
    result = await exec.executeAnonymous({
      apexCode: anonymousApex,
    });
  } catch (err) {
    const error = err as Error;
    throw new Error("Execution of anonymous apex failed with error: " + error.message);
  }
  if (!result.success) {
    throw new Error(`Failed to export Org Shape: ${JSON.stringify(result.diagnostic)}`);
  }
  const essentialLogs = filterApexLogs(result.logs!);
  const apexFeatures: string[] = JSON.parse(essentialLogs);
  return [...apexFeatures, ...checkFeatures].sort();
}

function filterApexLogs(input: string) {
  const regex =
    /(.*USER_DEBUG(\|[^\|]*){2}\|)((.|\n)+?)((\n[\d]{2}:[\d]{2}:[\d]{2}\.[\d]{1,3}|$))/g;
  let output = "";
  let m;
  while ((m = regex.exec(input)) !== null) {
    if (m[3]) {
      output += m[3] + "\n";
    }
  }
  return output;
}

async function getCustomObjectNames(conn: Connection) {
  const customObjects = await conn.metadata.list({ type: "CustomObject" });
  return customObjects
    .map((co) => [co.namespacePrefix, co.fullName].filter(Boolean).join("__"))
    .sort((a, b) => a.localeCompare(b));
}

async function getCustomFieldNames(conn: Connection) {
  const objectNames = ["Account", "Contact"];
  const fn = async (objectName: string) => {
    const res = await conn.describeSObject(objectName);
    return res.fields.map((f) => `${objectName}.${f.name}`);
  };
  const result = (await Promise.all(objectNames.map(fn))).flat();
  return result.sort((a, b) => a.localeCompare(b));
}

async function getSettingNames(conn: Connection) {
  const settings = await conn.metadata.list({ type: "Settings" });
  return settings.map((s) => s.fullName).sort((a, b) => a.localeCompare(b));
}

export type UserLicense = { LicenseDefinitionKey: string; Name: string };

async function getUserLicenses(conn: Connection) {
  const result = await conn.query<UserLicense>(
    "SELECT LicenseDefinitionKey, Name FROM UserLicense WHERE Status='Active' ORDER BY LicenseDefinitionKey ASC",
  );
  return result.records.map(({ LicenseDefinitionKey, Name }) => ({
    LicenseDefinitionKey,
    Name,
  }));
}

export type PermissionSetLicense = {
  DeveloperName: string;
  TotalLicenses: number;
};

async function getPermissionSetLicenses(conn: Connection) {
  const result = await conn.query<PermissionSetLicense>(
    "SELECT DeveloperName, TotalLicenses FROM PermissionSetLicense WHERE Status='Active' ORDER BY DeveloperName ASC",
  );
  return result.records.map(({ DeveloperName, TotalLicenses }) => ({
    DeveloperName,
    TotalLicenses,
  }));
}

async function getConnectApiFeatures(conn: Connection): Promise<string[]> {
  const anonymousApex = `ConnectApi.OrganizationSettings organizationSettings = ConnectApi.Organization.getSettings();
ConnectApi.Features features = organizationSettings.features;
System.debug(JSON.serializePretty(features, true));
`;
  try {
    const exec = new ExecuteService(conn);
    const result = await exec.executeAnonymous({
      apexCode: anonymousApex,
    });
    const essentialLogs = filterApexLogs(result.logs!);
    const features = JSON.parse(essentialLogs);
    return features;
  } catch (err) {
    const error = err as Error;
    throw new Error("Execution of anonymous apex failed with error: " + error.message);
  }
}

export async function runExport(conn: Connection) {
  return {
    customObjectNames: await getCustomObjectNames(conn),
    customFieldNames: await getCustomFieldNames(conn),
    settingNames: await getSettingNames(conn),
    userLicenses: await getUserLicenses(conn),
    permissionSetLicenses: await getPermissionSetLicenses(conn),
    connectApiFeatures: await getConnectApiFeatures(conn),
  };
}
