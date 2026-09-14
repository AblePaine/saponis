import type { MasterOilRecord } from "../types/soap.ts";
import oilsJson from "./oils.json" with { type: "json" };

export const OIL_DATABASE: MasterOilRecord[] = oilsJson as MasterOilRecord[];

export function getOilById(
  id: string,
  database: MasterOilRecord[] = OIL_DATABASE,
): MasterOilRecord | undefined {
  return database.find((oil) => oil.id === id);
}

export function getOilBySlug(
  slug: string,
  database: MasterOilRecord[] = OIL_DATABASE,
): MasterOilRecord | undefined {
  return database.find(
    (oil) =>
      oil.slug === slug || oil.id === slug || oil.aliases?.includes(slug),
  );
}

export function workhorseOils(
  database: MasterOilRecord[] = OIL_DATABASE,
): MasterOilRecord[] {
  return database.filter((oil) => oil.workhorse);
}
