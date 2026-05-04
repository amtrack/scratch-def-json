import type { Connection } from "@salesforce/core";
import type { Context } from "..";

// KnowledgeSettings enableKnowledge
// "setting/force.com/orgValue.ArticleSurveyResponsesLimit"
// "SELECT MasterLabel, Setting FROM TenantUsageEntitlement"
// Maximum knowledge article feedback responses allowed for an org

export default {
  check: async function (conn: Connection, ctx: Context) {
    if (ctx.customObjectNames.includes("Knowledge__kav")) {
      return "Knowledge";
    }
  },
};
