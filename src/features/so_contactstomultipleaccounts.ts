import type { Connection } from "@salesforce/core";
import type { Context } from "..";

export default {
  check: async function (conn: Connection, ctx: Context) {
    if (ctx.customObjectNames.includes("AccountContactRelation")) {
      return "ContactsToMultipleAccounts";
    }
  },
};
