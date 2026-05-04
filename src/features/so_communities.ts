// Seems to be enabled in Developer Edition Scratch Orgs by default
// Same as CommunitiesSettings:CommunitiesSettings enableNetworksEnabled
// When enableNetworksEnabled is enabled, there is also Account.IsPartner available

import type { Connection } from "@salesforce/core";
import type { Context } from "..";

export default {
  check: async function (conn: Connection, ctx: Context) {
    if (ctx.userLicenses.find((l) => l.LicenseDefinitionKey === "GUEST")) {
      return "Communities";
    }
  },
};
