"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { appearanceImages, images, publishableItems, publishableStats, recipes } from "../lib/catalog";
import { materialReferenceFor, materialSourceFor } from "../lib/material-sources";
import { buildAtlasGraph } from "../lib/atlas-graph.mjs";
import { buildAtlasCompletionQueue, completionSummary, COMPLETION_KIND_LABELS, filterCompletionRecords } from "../lib/atlas-completion.mjs";
import { coveredItemVisualFamilyIds, itemVisualFamilyFor, potionVisualFamilies, talismanVisualFamilies } from "../lib/visual-families";

const graph = buildAtlasGraph({ items: publishableItems, recipes, materialSourceFor });
const coveredVisualFamilyIds = coveredItemVisualFamilyIds({ items: publishableItems, images, appearanceImages });
const records = buildAtlasCompletionQueue({
  graph,
  images,
  coveredVisualFamilyIds,
  additionalVisualFamilies: [...talismanVisualFamilies, ...potionVisualFamilies],
  visualFamilyForItem: itemVisualFamilyFor,
  statsForItem: publishableStats,
  referenceForMaterial: materialReferenceFor,
});
const summary = completionSummary(records);
const filters = [
  ["all", "Tümü"],
  ["conflict", "Çelişki"],
  ["acquisition", "Elde etme"],
  ["stats", "Özellik"],
  ["material_source", "Malzeme"],
  ["media", "Görsel"],
  ["verification", "Teyit"],
] as const;

const priorityLabels: Record<string, string> = {
  critical: "Önce çöz",
  high: "Yüksek öncelik",
  medium: "Tamamlama",
};

export default function AtlasCompletionCenter() {
  const [kind, setKind] = useState("all");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => filterCompletionRecords(records, { kind, query }), [kind, query]);
  const shown = filtered.slice(0, 18);

  return <div className="completionCenter">
    <div className="completionHero">
      <div><p>M19 · ATLAS TAMAMLAMA MERKEZİ</p><h2>Eksikliği görünür yap.<br/><em>Doğru kanıtı topla.</em></h2></div>
      <p>Bu masa eksik bölgeyi veya kaynağı tahmin etmez. Her açık bağlantıyı, neden eksik olduğunu ve hangi kanıtla kapanacağını ayrı iş olarak gösterir.</p>
    </div>

    <div className="completionStats">
      <article className="critical"><small>ÇELİŞKİ</small><b>{summary.critical}</b><span>hesaptan uzak tutuluyor</span></article>
      <article><small>ELDE ETME</small><b>{summary.acquisition}</b><span>bağlantı bekliyor</span></article>
      <article><small>MALZEME</small><b>{summary.materialSources}</b><span>kaynak eşleşmesi yok</span></article>
      <article><small>GÖRSEL AİLESİ</small><b>{summary.media}</b><span>tek ortak görsel bekliyor</span></article>
      <article><small>İKİNCİ TEYİT</small><b>{summary.verification}</b><span>tek kaynaklı kayıt</span></article>
    </div>

    <div className="completionControls">
      <nav aria-label="Eksik bağlantı türü">{filters.map(([id, label]) => <button key={id} className={kind === id ? "active" : ""} onClick={() => setKind(id)}>{label}<b>{id === "all" ? records.length : records.filter((record) => record.kind === id).length}</b></button>)}</nav>
      <label><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Eşya veya malzeme ara"/></label>
    </div>

    <div className="completionResultHead"><span>{filtered.length} açık iş</span><b>İlk 18 kayıt gösteriliyor</b></div>
    <div className="completionList">
      {shown.length ? shown.map((record) => <article key={record.id} data-priority={record.priority}>
        <i>{record.entityType === "item" ? "E" : record.entityType === "visual" ? "G" : "M"}</i>
        <div><small>{COMPLETION_KIND_LABELS[record.kind]} · {priorityLabels[record.priority]}</small><h3>{record.name}</h3><span>{record.subtitle}</span><p>{record.detail}</p></div>
        <nav><Link href={record.href ?? `/?module=atlas&node=${encodeURIComponent(record.entityId)}#atlas`}>{record.entityType === "visual" ? "İlgili kataloğu aç" : "Atlas kaydını aç"}</Link><Link href="/?module=contribute#contribute">Eksikliği bildir</Link></nav>
      </article>) : <div className="completionEmpty"><b>Bu filtrede açık iş yok.</b><span>Aramayı veya eksik türünü değiştir.</span></div>}
    </div>
    {filtered.length > shown.length && <p className="completionLimit">Liste mobilde gereksiz uzamasın diye ilk 18 kayıt gösteriliyor. Arama ve tür filtresiyle kalan kayda doğrudan ulaşabilirsin.</p>}
  </div>;
}
