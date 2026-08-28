import materialIconRows from "../data/material-icons.json" with { type: "json" };
import materialIconInlineRows from "../data/material-icons-inline.json" with { type: "json" };

type MaterialIconRow = { name: string; path: string; sourceId: string };

const normalize = (value: string) => value.trim().toLocaleLowerCase("tr-TR");
const inlineByPath = new Map((materialIconInlineRows as { path: string; dataUri: string }[]).map((row) => [row.path, row.dataUri]));

export const materialIcons = (materialIconRows as MaterialIconRow[]).map((row) => ({
  ...row,
  // The original game icon is embedded so production does not depend on a
  // separate static-file request. `path` is retained for provenance/tests.
  src: inlineByPath.get(row.path) ?? row.path,
}));

const iconByName = new Map(materialIcons.map((row) => [normalize(row.name), row]));

export function materialIconFor(name: string) {
  return iconByName.get(normalize(name)) ?? null;
}
