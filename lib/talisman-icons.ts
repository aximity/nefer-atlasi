import talismanIconInlineRows from "../data/talisman-icons-inline.json" with { type: "json" };
import type { CharacterClass, Talisman } from "./catalog";

type TalismanColor = Talisman["color"];
type TalismanIconRow = {
  class: CharacterClass;
  color: TalismanColor;
  path: string;
  dataUri: string;
};

export type TalismanIcon = TalismanIconRow & { src: string };

const identityFor = (klass: CharacterClass, color: TalismanColor) => `${klass}|${color}`;

export const talismanIcons = (talismanIconInlineRows as TalismanIconRow[]).map((row) => ({
  ...row,
  // Embed the original game icon so production does not depend on a
  // separate static-file request. `path` remains available for provenance.
  src: row.dataUri,
}));

const iconByIdentity = new Map(
  talismanIcons.map((row) => [identityFor(row.class, row.color), row]),
);

export function talismanIconFor(talisman: Pick<Talisman, "class" | "color">) {
  return iconByIdentity.get(identityFor(talisman.class, talisman.color)) ?? null;
}
