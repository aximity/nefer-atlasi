"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { atlasCoverage, buildAtlasGraph, searchAtlasNodes } from "../lib/atlas-graph.mjs";
import { images, itemEvidence, publishableItems, publishableStats, recipes, sourceFor, statusLabel } from "../lib/catalog";
import { materialSourceFor } from "../lib/material-sources";
import { summarizeMarket } from "../lib/market-board.mjs";
import { displayUnit } from "../lib/presentation.mjs";

type NodeType = "all" | "item" | "material" | "boss" | "region";
type PublishedRow = { id: string; type: string; subject: string; server: string; observedAt: string; sourceCount: number; details: Record<string, unknown> };
type AtlasNode = {
  id: string; key: string; type: Exclude<NodeType, "all">; name: string; subtitle: string; searchText: string;
  verificationStatus: "draft" | "single_source" | "cross_verified" | "conflicted";
  item?: (typeof publishableItems)[number]; recipe?: (typeof recipes)[number] | null; region?: string | null; boss?: string | null;
  source?: ReturnType<typeof materialSourceFor>; uses?: Array<{ itemId: string; itemName: string; quantity: number; verificationStatus: string }>;
  itemIds?: string[]; materialKeys?: string[]; bosses?: string[];
};

const graph = buildAtlasGraph({ items: publishableItems, recipes, materialSourceFor }) as {
  nodes: AtlasNode[]; itemNodes: AtlasNode[]; materialNodes: AtlasNode[]; bossNodes: AtlasNode[]; regionNodes: AtlasNode[];
};
const coverage = atlasCoverage(graph);
const labels: Record<NodeType, string> = { all: "Tümü", item: "Eşya", material: "Malzeme", boss: "Boss", region: "Bölge" };
const icons: Record<Exclude<NodeType, "all">, string> = { item: "E", material: "M", boss: "B", region: "R" };
const fmt = (value: number) => new Intl.NumberFormat("tr-TR").format(value);

function priceText(value: number | null, currency: "Oyun parası" | "TL") {
  if (value == null) return "Veri yok";
  const number = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: currency === "TL" ? 2 : 0 }).format(value);
  return currency === "TL" ? `${number} TL` : number;
}

export default function ConnectedAtlas() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<NodeType>("all");
  const [selectedId, setSelectedId] = useState(graph.itemNodes[0]?.id || graph.materialNodes[0]?.id || "");
  const [marketRows, setMarketRows] = useState<PublishedRow[]>([]);
  const [marketState, setMarketState] = useState<"loading" | "ready" | "unavailable">("loading");
  const selected = graph.nodes.find((node) => node.id === selectedId) || graph.nodes[0];
  const shown = useMemo(() => searchAtlasNodes(graph.nodes, query, type).slice(0, 100) as AtlasNode[], [query, type]);

  useEffect(() => {
    const requested = new URLSearchParams(location.search).get("node");
    if (requested && graph.nodes.some((node) => node.id === requested)) {
      queueMicrotask(() => setSelectedId(requested));
    }
    const controller = new AbortController();
    fetch("/api/contributions/published", { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then((data) => { setMarketRows(Array.isArray(data.rows) ? data.rows : []); setMarketState("ready"); })
      .catch((error) => { if (error?.name !== "AbortError") setMarketState("unavailable"); });
    return () => controller.abort();
  }, []);

  const market = useMemo(() => {
    if (!selected) return [];
    return (["Oyun parası", "TL"] as const).flatMap((currency) => summarizeMarket(marketRows, { currency }).filter((row) => row.subject.toLocaleLowerCase("tr-TR") === selected.name.toLocaleLowerCase("tr-TR")));
  }, [marketRows, selected]);

  function selectNode(node: AtlasNode) {
    setSelectedId(node.id);
    const url = new URL(location.href);
    url.searchParams.set("module", "atlas");
    url.searchParams.set("node", node.id);
    history.replaceState(null, "", url);
  }

  function nodeFor(typeValue: AtlasNode["type"], key: string) {
    return graph.nodes.find((node) => node.type === typeValue && node.key === key);
  }

  async function copyPath() {
    if (!selected) return;
    const url = `${location.origin}${location.pathname}?module=atlas&node=${encodeURIComponent(selected.id)}#atlas`;
    await navigator.clipboard.writeText(`${selected.name} · Nefer Atlası\n${url}`);
  }

  return <section className="connected-atlas" id="atlas">
    <div className="atlas-head">
      <div><p>M18 · BAĞLANTILI BİLGİ GRAFİĞİ</p><h2>Bir kaydı aç.<br/><em>Tüm zinciri gör.</em></h2></div>
      <p>Eşyanın düştüğü bossu, reçetesini, gereken malzemeyi, malzemenin geniş bölgesini ve doğrulanmış pazar sinyalini tek akışta izle.</p>
    </div>
    <div className="atlas-kpis"><article><small>EŞYA</small><b>{coverage.itemCount}</b><span>yayımlanabilir kayıt</span></article><article><small>REÇETE BAĞI</small><b>{coverage.recipeItemCount}</b><span>eşya</span></article><article><small>MALZEME</small><b>{coverage.materialCount}</b><span>{coverage.sourcedMaterialCount} kaynak eşleşmeli</span></article><article><small>HARİTA</small><b>{coverage.regionCount}</b><span>{coverage.bossCount} boss</span></article></div>
    <div className="atlas-integrity"><b>{coverage.unknownMaterialCount} açık bağlantı</b><span>Kaynağı eşleşmeyen malzemelere tahmini bölge, yaratık veya fiyat atanmıyor.</span></div>
    <div className="atlas-workspace">
      <aside className="atlas-browser">
        <label><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Eşya, malzeme, boss veya bölge ara"/></label>
        <nav aria-label="Atlas kayıt türü">{(["all", "item", "material", "boss", "region"] as NodeType[]).map((item) => <button key={item} className={type === item ? "active" : ""} onClick={() => setType(item)}>{labels[item]}<b>{item === "all" ? graph.nodes.length : graph.nodes.filter((node) => node.type === item).length}</b></button>)}</nav>
        <div className="atlas-results">{shown.length ? shown.map((node) => <button key={node.id} className={selected?.id === node.id ? "selected" : ""} onClick={() => selectNode(node)}><i className={node.type}>{icons[node.type]}</i><span><small>{labels[node.type]}</small><b>{node.name}</b><em>{node.subtitle}</em></span><strong>›</strong></button>) : <p>Bu aramayla eşleşen kaynaklı kayıt yok.</p>}</div>
      </aside>
      <main className="atlas-detail">
        {selected && <>
          <header><div><small>{labels[selected.type].toUpperCase()} · {statusLabel[selected.verificationStatus]}</small><h3>{selected.name}</h3><p>{selected.subtitle}</p></div><button onClick={copyPath}>Bağlantıyı kopyala</button></header>
          {selected.type === "item" && selected.item && <ItemAtlasDetail node={selected} selectNode={selectNode} nodeFor={nodeFor}/>} 
          {selected.type === "material" && <MaterialAtlasDetail node={selected} selectNode={selectNode} nodeFor={nodeFor}/>} 
          {selected.type === "boss" && <BossAtlasDetail node={selected} selectNode={selectNode} nodeFor={nodeFor}/>} 
          {selected.type === "region" && <RegionAtlasDetail node={selected} selectNode={selectNode} nodeFor={nodeFor}/>} 
          <section className="atlas-market"><header><span>PAZAR BAĞLANTISI</span><Link href={`/?module=mining&view=Pazar&material=${encodeURIComponent(selected.name)}#mining`}>Pazarda aç ↗</Link></header>{marketState === "loading" ? <p>Kayıtlar okunuyor…</p> : market.length ? <div>{market.map((row) => <article key={row.currency}><small>{row.currency} · 7 GÜNLÜK BİRİM MEDYANI</small><b>{priceText(row.sevenDayMedian, row.currency)}</b><span>{row.sevenDayCount} gözlem · {row.evidence.label}</span></article>)}</div> : <p>{marketState === "unavailable" ? "Pazar verisi şu an okunamadı." : "Bu adla çapraz doğrulanmış fiyat kaydı yok; boşluk tahminle doldurulmadı."}</p>}</section>
          <div className="atlas-actions"><Link href={selected.type === "item" ? `/?module=items&item=${selected.key}#items` : `/?module=mining&view=Kaynaklar&material=${encodeURIComponent(selected.name)}#mining`}>{selected.type === "item" ? "Eşya kartını aç" : "Kaynak rehberinde aç"}</Link><Link href="/farm-operasyonu">Saha operasyonu ↗</Link><Link href="/?module=contribute#contribute">Eksik bağlantı bildir ↗</Link></div>
        </>}
      </main>
    </div>
  </section>;
}

function ItemAtlasDetail({ node, selectNode, nodeFor }: { node: AtlasNode; selectNode: (node: AtlasNode) => void; nodeFor: (type: AtlasNode["type"], key: string) => AtlasNode | undefined }) {
  const item = node.item!;
  const visual = images.find((image) => image.itemId === item.id);
  const stats = publishableStats(item.id);
  const evidence = itemEvidence(item.id);
  const itemSource = sourceFor(evidence[0]?.sourceId);
  const recipeSource = node.recipe ? sourceFor(node.recipe.sourceId) : null;
  const bossNode = graph.bossNodes.find((candidate) => candidate.name === node.boss && candidate.region === node.region);
  const regionNode = node.region ? nodeFor("region", node.region.toLocaleLowerCase("tr-TR")) : null;
  return <div className="atlas-item-detail">
    {visual && <div className="atlas-item-image"><Image src={visual.url} alt={`${item.name} oyun içi görünümü`} width={1200} height={1600}/><span>OYUN İÇİ GÖRSEL · KAYNAK EŞLEŞMELİ</span></div>}
    <section className="atlas-origin"><header><span>ELDE ETME ZİNCİRİ</span></header><div>{regionNode ? <button onClick={() => selectNode(regionNode)}><small>BÖLGE</small><b>{node.region}</b></button> : <article><small>BÖLGE</small><b>Eşleşme yok</b></article>}<i>→</i>{bossNode ? <button onClick={() => selectNode(bossNode)}><small>BOSS</small><b>{node.boss}</b></button> : <article><small>BOSS</small><b>Eşleşme yok</b></article>}<i>→</i><article><small>SONUÇ</small><b>{node.recipe?.method || item.acquisition || "Ganimet kaydı"}</b></article></div></section>
    {stats.length > 0 && <section className="atlas-stats"><header><span>OYUN İÇİ ÖZELLİKLER</span></header><div>{stats.map((stat) => <article key={stat.id}><span>{stat.attribute}</span><b>{fmt(stat.value)}{displayUnit(stat.unit) ? ` ${displayUnit(stat.unit)}` : ""}</b></article>)}</div></section>}
    {node.recipe ? <section className="atlas-recipe"><header><span>REÇETE · {node.recipe.materials.length} MALZEME</span><b>{node.recipe.verificationStatus === "cross_verified" ? "Çapraz doğrulandı" : "Tek kaynak"}</b></header><div>{node.recipe.materials.map((material) => { const materialNode = nodeFor("material", material.name.toLocaleLowerCase("tr-TR")); return <button key={material.name} onClick={() => materialNode && selectNode(materialNode)} disabled={!materialNode}><span><small>{materialNode?.region || "Kaynak eşleşmesi yok"}</small><b>{material.name}</b></span><strong>×{material.quantity}</strong></button>; })}</div></section> : <p className="atlas-empty-link">Bu eşya için reçete bağlantısı yok.</p>}
    <div className="atlas-source-row">{itemSource && <a href={itemSource.url} target="_blank" rel="noreferrer">Eşya kaynağı · {itemSource.title} ↗</a>}{recipeSource && recipeSource.id !== itemSource?.id && <a href={recipeSource.url} target="_blank" rel="noreferrer">Reçete kaynağı · {recipeSource.title} ↗</a>}</div>
  </div>;
}

function MaterialAtlasDetail({ node, selectNode, nodeFor }: { node: AtlasNode; selectNode: (node: AtlasNode) => void; nodeFor: (type: AtlasNode["type"], key: string) => AtlasNode | undefined }) {
  const source = node.source;
  const regionNode = node.region ? nodeFor("region", node.region.toLocaleLowerCase("tr-TR")) : null;
  return <div className="atlas-material-detail">
    <section className={`atlas-material-source ${source ? "known" : "unknown"}`}><header><span>MALZEME KAYNAĞI</span><b>{source ? "Eşleşti" : "Açık bağlantı"}</b></header>{source?.kind === "gathering" ? <div><article><small>MESLEK</small><b>{source.profession}</b></article><article><small>ANA KAYNAK</small><b>{source.base}</b></article><article><small>ÇIKTI</small><b>{source.output}. çıktı</b></article>{regionNode ? <button onClick={() => selectNode(regionNode)}><small>GENİŞ BÖLGE</small><b>{source.region}</b></button> : <article><small>GENİŞ BÖLGE</small><b>{source.region}</b></article>}</div> : source?.kind === "creature_drop" ? <div><article><small>TÜR</small><b>Yaratık ganimeti</b></article><article><small>DÜŞMAN</small><b>{source.enemy}</b></article><article><small>KULLANIM</small><b>{source.usage}</b></article>{regionNode ? <button onClick={() => selectNode(regionNode)}><small>GENİŞ BÖLGE</small><b>{source.region}</b></button> : <article><small>GENİŞ BÖLGE</small><b>{source.region}</b></article>}</div> : <p>Bu malzeme için doğrulanmış toplayıcılık veya yaratık kaynağı eşleşmedi. Bölge tahmin edilmedi.</p>}{source?.kind === "creature_drop" && source.source && <a href={source.source} target="_blank" rel="noreferrer">Malzeme kaynağı ↗</a>}</section>
    <section className="atlas-uses"><header><span>KULLANILDIĞI REÇETELER</span><b>{node.uses?.length || 0} bağlantı</b></header><div>{node.uses?.map((use) => { const itemNode = nodeFor("item", use.itemId); return <button key={`${use.itemId}-${use.quantity}`} onClick={() => itemNode && selectNode(itemNode)}><span><small>{use.verificationStatus === "cross_verified" ? "Çapraz doğrulandı" : "Tek kaynak"}</small><b>{use.itemName}</b></span><strong>×{use.quantity}</strong></button>; })}</div></section>
  </div>;
}

function BossAtlasDetail({ node, selectNode, nodeFor }: { node: AtlasNode; selectNode: (node: AtlasNode) => void; nodeFor: (type: AtlasNode["type"], key: string) => AtlasNode | undefined }) {
  const regionNode = node.region ? nodeFor("region", node.region.toLocaleLowerCase("tr-TR")) : null;
  return <div className="atlas-boss-detail"><section className="atlas-boss-banner"><small>BÖLÜM SONU DÜŞMANI</small><b>{node.name}</b>{regionNode && <button onClick={() => selectNode(regionNode)}>{node.region} bölgesini aç ↗</button>}</section><section className="atlas-uses"><header><span>BAĞLI EŞYALAR</span><b>{node.itemIds?.length || 0} kayıt</b></header><div>{node.itemIds?.map((id) => { const itemNode = nodeFor("item", id); return itemNode && <button key={id} onClick={() => selectNode(itemNode)}><span><small>{itemNode.item?.class} · {itemNode.item?.slot}</small><b>{itemNode.name}</b></span><strong>›</strong></button>; })}</div></section></div>;
}

function RegionAtlasDetail({ node, selectNode, nodeFor }: { node: AtlasNode; selectNode: (node: AtlasNode) => void; nodeFor: (type: AtlasNode["type"], key: string) => AtlasNode | undefined }) {
  return <div className="atlas-region-detail"><section className="atlas-region-summary"><article><small>BOSS</small><b>{node.bosses?.length || 0}</b></article><article><small>EŞYA</small><b>{node.itemIds?.length || 0}</b></article><article><small>MALZEME</small><b>{node.materialKeys?.length || 0}</b></article></section>{node.bosses?.length ? <section className="atlas-region-bosses"><header><span>BOSSLAR</span></header><div>{node.bosses.map((boss) => { const bossNode = graph.bossNodes.find((candidate) => candidate.name === boss && candidate.region === node.name); return <button key={boss} onClick={() => bossNode && selectNode(bossNode)}>{boss}<span>›</span></button>; })}</div></section> : null}<section className="atlas-region-columns"><div><header><span>EŞYALAR</span></header>{node.itemIds?.slice(0, 30).map((id) => { const itemNode = nodeFor("item", id); return itemNode && <button key={id} onClick={() => selectNode(itemNode)}>{itemNode.name}<span>›</span></button>; })}</div><div><header><span>MALZEMELER</span></header>{node.materialKeys?.map((key) => { const materialNode = nodeFor("material", key); return materialNode && <button key={key} onClick={() => selectNode(materialNode)}>{materialNode.name}<span>›</span></button>; })}</div></section></div>;
}
