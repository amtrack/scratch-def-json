import type { Connection } from "@salesforce/core";

export async function getSourceOrg(conn: Connection) {
  try {
    const res = await conn.query("SELECT Id FROM ShapeRepresentation WHERE Status='Active'");
    if (res.records.length > 0) {
      return conn.accessToken!.match(/^00D\w{12}/)?.[0];
    }
  } catch (_) {}
}
