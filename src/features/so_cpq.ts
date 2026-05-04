import type { Connection } from "@salesforce/core";
import type { Context } from "..";

export default {
  check: async function (conn: Connection, ctx: Context) {
    if (
      ctx.permissionSetLicenses.find((l) => l.DeveloperName === "SalesforceCPQ_CPQStandardPerm")
    ) {
      return "CPQ";
    }
  },
};
