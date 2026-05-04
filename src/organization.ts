import { type Record } from "@jsforce/jsforce-node";
import { type Connection } from "@salesforce/core";

type Organization = Record & {
  Name: string;
  OrganizationType: string;
  LanguageLocaleKey: string;
  Country: string;
};
export async function getOrganization(conn: Connection) {
  const organization = await conn.query<Organization>(
    "SELECT Name, OrganizationType, LanguageLocaleKey, Country FROM Organization",
  );
  const { attributes, ...data } = organization.records[0];
  return data;
}
