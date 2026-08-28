import materialIconRows from "../data/material-icons.json" with { type: "json" };

type MaterialIcon = { name: string; path: string; sourceId: string };

const normalize = (value: string) => value.trim().toLocaleLowerCase("tr-TR");
const iconByName = new Map((materialIconRows as MaterialIcon[]).map((row) => [normalize(row.name), row]));

export const materialIcons = materialIconRows as MaterialIcon[];

export function materialIconFor(name: string) {
  return iconByName.get(normalize(name)) ?? null;
}
