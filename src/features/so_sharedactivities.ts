import type { Connection } from "@salesforce/core";
import type { Context } from "..";

export default {
  check: async function (conn: Connection, ctx: Context) {
    // Alternative: await conn.tooling.query("SELECT AllowUsersToRelateMultipleContactsToTasksAndEvents FROM ActivitiesSettings")
    const response = await conn.metadata.read("ActivitiesSettings", "ActivitiesSettings");
    if (response.allowUsersToRelateMultipleContactsToTasksAndEvents) {
      return "SharedActivities";
    }
  },
};
