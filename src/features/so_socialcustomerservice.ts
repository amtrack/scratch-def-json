import type { Connection } from "@salesforce/core";
import type { Context } from "..";

// This is available by default in Enterprise editions

export default {
  check: async function (conn: Connection, ctx: Context) {
    if (ctx.settingNames.includes("SocialCustomerService")) {
      return "SocialCustomerService";
    }
  },
};
