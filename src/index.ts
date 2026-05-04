import { Connection, Org, type ScratchOrgDef } from "@salesforce/core";
import { getFeatures, PermissionSetLicense, runExport, UserLicense } from "./features.ts";
import { getOrganization } from "./organization.ts";
import { getSourceOrg } from "./source-org.ts";

export {
  diffObjectSettings,
  getObjectSettings,
  getSettings,
  type ObjectSettings,
} from "./settings.ts";

export type Context = {
  // edition: string;
  customObjectNames: string[];
  customFieldNames: string[];
  settingNames: string[];
  userLicenses: UserLicense[];
  permissionSetLicenses: PermissionSetLicense[];
  connectApiFeatures: string[];
};

export async function getScratchDefJsonWithSourceOrg(conn: Connection) {
  const organization = await getOrganization(conn);
  const orgName = organization.Name;

  const sourceOrg = await getSourceOrg(conn);
  if (!sourceOrg) {
    throw new Error("Could not find any Org Shapes (ShapeRepresentation)");
  }
  return { orgName, sourceOrg };
}

export async function getScratchDefJson(conn: Connection): Promise<ScratchOrgDef> {
  const organization = await getOrganization(conn);
  const orgName = organization.Name;
  const edition = organization.OrganizationType.replace(" Edition", "");
  const common = await runExport(conn);
  const ctx: Context = {
    ...common,
    //edition
  };
  const features = await getFeatures(conn, ctx);
  return {
    orgName,
    edition,
    language: organization.LanguageLocaleKey,
    country: organization.Country,
    features,
    // objectSettings: {},
  };
}

if (import.meta.main) {
  const conn = (await Org.create({})).getConnection();
  const result = await getScratchDefJson(conn);
  console.log(result);
}
