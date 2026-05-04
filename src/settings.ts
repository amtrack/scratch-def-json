import type { Connection } from "@salesforce/core";

type ObjectSetting = { sharingModel: string };
export type ObjectSettings = Record<string, ObjectSetting>;

export async function getObjectSettings(conn: Connection): Promise<ObjectSettings> {
  const result = await conn.tooling.query<{
    QualifiedApiName: string;
    InternalSharingModel: string;
  }>(
    "SELECT QualifiedApiName, InternalSharingModel FROM EntityDefinition WHERE IsCustomizable = true AND IsDeprecatedAndHidden = false ORDER BY QualifiedApiName ASC",
  );
  return Object.fromEntries(
    (result.records ?? []).map((r) => [
      r.QualifiedApiName.charAt(0).toLowerCase() + r.QualifiedApiName.slice(1),
      { sharingModel: r.InternalSharingModel },
    ]),
  );
}

export async function getSettings(conn: Connection): Promise<Record<string, unknown>> {
  const list = await conn.metadata.list([{ type: "Settings" }]);
  const items = Array.isArray(list) ? list : list ? [list] : [];
  const entries = await Promise.all(
    items.map(async (item) => {
      try {
        const type = `${item.fullName}Settings` as Parameters<typeof conn.metadata.read>[0];
        const data = await conn.metadata.read(type, type);
        const key = item.fullName.charAt(0).toLowerCase() + item.fullName.slice(1);
        return [key, data] as const;
      } catch {
        const key = item.fullName.charAt(0).toLowerCase() + item.fullName.slice(1);
        return [key, null] as const;
      }
    }),
  );
  return Object.fromEntries(entries);
}

/** Returns entries from target whose sharingModel differs from source, restricted to shared standard keys. */
export function diffObjectSettings(
  source: ObjectSettings = {},
  target: ObjectSettings,
): ObjectSettings {
  return Object.fromEntries(
    Object.entries(target).filter(
      ([name, { sharingModel }]) =>
        !name.includes("__") && source[name] != null && source[name].sharingModel !== sharingModel,
    ),
  );
}
