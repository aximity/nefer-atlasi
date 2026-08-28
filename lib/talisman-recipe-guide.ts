import { sourceFor, talismans, type CharacterClass } from "./catalog.ts";
import { materialSourceFor } from "./material-sources.ts";
import type { TalismanRecipeMaterial } from "./talisman-recipes.ts";

const GATHERING_OUTPUT_SOURCE = "https://www.sadece1.com/konular/istanbul-kiyamet-vakti-toplayicilik-madencilik-rehberi.248/";
const BUYUK_HOL_GATHERING_SOURCE = "https://www.scribd.com/doc/122950719/%C4%B0KV-Gerekli-Bilgiler";
const KO_SCOPE_NOTE = "Normal İKV edinim kaydı Kıyametin Öncüleri sunucusuna otomatik taşınmaz; KÖ oyun içi kanıtıyla ayrıca doğrulanmalıdır.";

export type TalismanRecipeGuideEvidence = {
  normalIkv: {
    label: "Normal İKV";
    status: "source_matched" | "needs_verification";
    sources: readonly string[];
    summary: string;
  };
  kiyametinOnculeri: {
    label: "Kıyametin Öncüleri";
    status: "needs_verification";
    sources: readonly [];
    summary: string;
  };
};

type GuideBase = {
  name: string;
  quantity: number;
  label: string;
  detail: string;
  href: string;
  evidence: TalismanRecipeGuideEvidence;
};

export type PreviousTalismanGuide = GuideBase & {
  kind: "talisman";
  talismanId: string;
  talisman: {
    name: string;
    class: CharacterClass;
    color: "Kırmızı" | "Mavi";
    series: string;
    tier: 1 | 2 | 3 | null;
  };
};

export type GatheringMaterialGuide = GuideBase & {
  kind: "gathering";
  base: string;
  output: 1 | 2 | 3;
  profession: "Madenci" | "Sarraf" | "Lokman";
  region: string;
  points: number;
};

export type CreatureDropMaterialGuide = GuideBase & {
  kind: "creature_drop";
  enemy: string;
  region: string | null;
  vendor: string | null;
  verification: "Kaynaklı kayıt" | "Oyuncu bilgisi";
};

export type UnresolvedMaterialGuide = GuideBase & {
  kind: "unresolved";
  reason: "missing_talisman_id" | "unknown_talisman" | "source_not_found" | "source_kind_not_supported";
};

export type TalismanRecipeMaterialGuide =
  | PreviousTalismanGuide
  | GatheringMaterialGuide
  | CreatureDropMaterialGuide
  | UnresolvedMaterialGuide;

const koEvidence = (): TalismanRecipeGuideEvidence["kiyametinOnculeri"] => ({
  label: "Kıyametin Öncüleri",
  status: "needs_verification",
  sources: [],
  summary: KO_SCOPE_NOTE,
});

const unresolvedEvidence = (summary: string): TalismanRecipeGuideEvidence => ({
  normalIkv: {
    label: "Normal İKV",
    status: "needs_verification",
    sources: [],
    summary,
  },
  kiyametinOnculeri: koEvidence(),
});

export function talismanInternalHref(talismanId: string) {
  return `/?module=engine&talisman=${encodeURIComponent(talismanId)}#engine`;
}

export function materialInternalHref(materialName: string) {
  const key = materialName.trim().toLocaleLowerCase("tr-TR");
  return `/?module=atlas&node=${encodeURIComponent(`material:${key}`)}#atlas`;
}

export function talismanRecipeMaterialGuideFor(material: TalismanRecipeMaterial): TalismanRecipeMaterialGuide {
  const base = { name: material.name, quantity: material.quantity };
  const materialHref = materialInternalHref(material.name);

  if (material.kind === "talisman") {
    if (!material.talismanId) {
      return {
        ...base,
        kind: "unresolved",
        reason: "missing_talisman_id",
        label: "Önceki tılsım doğrulanıyor",
        detail: "Reçetede tılsım kimliği eksik",
        href: materialHref,
        evidence: unresolvedEvidence("Reçete girdisinde önceki kademe tılsım kimliği bulunmuyor; ad üzerinden tahmin yapılmadı."),
      };
    }
    const talisman = talismans.find((row) => row.id === material.talismanId);
    if (!talisman) {
      return {
        ...base,
        kind: "unresolved",
        reason: "unknown_talisman",
        label: "Önceki tılsım doğrulanıyor",
        detail: "Tılsım kimliği katalogda bulunamadı",
        href: materialHref,
        evidence: unresolvedEvidence("Reçetedeki tılsım kimliği katalogda bulunamadı; yakın adla eşleştirme yapılmadı."),
      };
    }
    const source = sourceFor(talisman.sourceId);
    return {
      ...base,
      kind: "talisman",
      talismanId: talisman.id,
      label: "Önceki kademe tılsım",
      detail: `${talisman.name} · ${talisman.class} · ${talisman.color}`,
      href: talismanInternalHref(talisman.id),
      talisman: {
        name: talisman.name,
        class: talisman.class,
        color: talisman.color,
        series: talisman.series,
        tier: talisman.tier,
      },
      evidence: {
        normalIkv: {
          label: "Normal İKV",
          status: source ? "source_matched" : "needs_verification",
          sources: source ? [source.url] : [],
          summary: "Reçete girdisi, ad benzerliğiyle değil kayıtlı talismanId üzerinden önceki kademe tılsıma bağlanır. Bu satır ayrıca bir KÖ edinim iddiası oluşturmaz.",
        },
        kiyametinOnculeri: koEvidence(),
      },
    };
  }

  const source = materialSourceFor(material.name);
  if (!source) {
    return {
      ...base,
      kind: "unresolved",
      reason: "source_not_found",
      label: "Edinim doğrulanıyor",
      detail: "Kaynak veya bölge tahmin edilmedi",
      href: materialHref,
      evidence: unresolvedEvidence("Bu malzeme için doğrulanmış toplayıcılık veya yaratık ganimeti kaynağı eşleşmedi; bölge tahmin edilmedi."),
    };
  }

  if (source.kind === "gathering") {
    return {
      ...base,
      kind: "gathering",
      label: `${source.profession} · ${source.output}. çıktı`,
      detail: `${source.base} · ${source.region} · ${source.points} puan`,
      href: materialHref,
      base: source.base,
      output: source.output as 1 | 2 | 3,
      profession: source.profession,
      region: source.region,
      points: source.points,
      evidence: {
        normalIkv: {
          label: "Normal İKV",
          status: "source_matched",
          sources: [GATHERING_OUTPUT_SOURCE, BUYUK_HOL_GATHERING_SOURCE],
          summary: `${source.base} ana kaynağının ${source.output}. çıktısı ${material.name}; ${source.profession} mesleğiyle ${source.region} bölgesinde ${source.points} puanda toplanır.`,
        },
        kiyametinOnculeri: koEvidence(),
      },
    };
  }

  if (source.kind === "creature_drop") {
    const sourceMatched = source.verification === "Kaynaklı kayıt";
    return {
      ...base,
      kind: "creature_drop",
      label: source.vendor ? "Yaratık ganimeti / OOK" : "Yaratık ganimeti",
      detail: source.vendor
        ? `${source.enemy} · ${source.vendor}`
        : `${source.enemy} · ${source.region ?? "Bölge belirtilmiyor"}`,
      href: materialHref,
      enemy: source.enemy,
      region: source.region,
      vendor: source.vendor ?? null,
      verification: source.verification,
      evidence: {
        normalIkv: {
          label: "Normal İKV",
          status: sourceMatched ? "source_matched" : "needs_verification",
          sources: source.source ? [source.source] : [],
          summary: source.vendor
            ? `${source.enemy}; ayrıca ${source.vendor}. Kaynakta belirtilmeyen yaratık türü veya bölge tahmin edilmedi.`
            : `${source.enemy}; bölge: ${source.region ?? "kaynakta belirtilmiyor"}.`,
        },
        kiyametinOnculeri: koEvidence(),
      },
    };
  }

  return {
    ...base,
    kind: "unresolved",
    reason: "source_kind_not_supported",
    label: "Edinim doğrulanıyor",
    detail: `${source.kind} kaynağı henüz bu rehberde modellenmedi`,
    href: materialHref,
    evidence: unresolvedEvidence(`Bu malzemenin ${source.kind} edinim türü tılsım reçetesi rehberinde henüz modellenmedi.`),
  };
}

