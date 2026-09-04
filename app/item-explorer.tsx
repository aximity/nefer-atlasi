"use client";

import { useEffect, useState } from "react";
import {
  items,
  publishableItems,
  type CharacterClass,
  type Item,
} from "../lib/catalog";
import { itemVisualFamilyInventory } from "../lib/visual-families";
import { ComparePanel, ItemCard, ItemModal } from "./item-explorer-parts";
import Title from "./section-title";

const classes: CharacterClass[] = ["Savaşçı", "Büyücü", "Şifacı"];
const itemFamilyInventory = itemVisualFamilyInventory(publishableItems);

export default function ItemExplorer({
  initialItemId = "",
  focusInitialItem = false,
  onCloseItem,
}: {
  initialItemId?: string;
  focusInitialItem?: boolean;
  onCloseItem: () => void;
}) {
  const initialItem = items.find((item) => item.id === initialItemId) ?? null;
  const [query, setQuery] = useState(focusInitialItem && initialItem ? initialItem.name : "");
  const [classFilter, setClassFilter] = useState(focusInitialItem && initialItem && initialItem.class !== "Tüm Sınıflar" ? initialItem.class : "Tümü");
  const [slotFilter, setSlotFilter] = useState(focusInitialItem && initialItem ? initialItem.slot : "Tümü");
  const [itemVisibleLimit, setItemVisibleLimit] = useState(24);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [detail, setDetail] = useState<Item | null>(initialItem);
  const [notice, setNotice] = useState("");

  const closeDetail = () => {
    setDetail(null);
    onCloseItem();
  };
  useEffect(() => {
    if (!detail) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDetail(null);
        onCloseItem();
      }
    };
    addEventListener("keydown", closeOnEscape);
    return () => removeEventListener("keydown", closeOnEscape);
  }, [detail, onCloseItem]);

  const filtered = publishableItems.filter(
    (item) =>
      (!query || `${item.name} ${item.class} ${item.slot}`.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR"))) &&
      (classFilter === "Tümü" || item.class === classFilter) &&
      (slotFilter === "Tümü" || item.slot === slotFilter),
  );
  const visibleItems = filtered.slice(0, itemVisibleLimit);
  const compareItems = compareIds
    .map((id) => items.find((item) => item.id === id))
    .filter((item): item is Item => Boolean(item));
  const toggleCompare = (item: Item) => {
    setNotice("");
    if (compareIds.includes(item.id)) return setCompareIds(compareIds.filter((id) => id !== item.id));
    const first = compareItems[0];
    if (first && (first.class !== item.class || first.slot !== item.slot)) {
      return setNotice(`Karşılaştırma için aynı sınıf ve yuvadan eşya seç: ${first.class} · ${first.slot}.`);
    }
    setCompareIds([...compareIds.slice(-1), item.id]);
  };

  return <section className="catalog" id="items">
    <Title eyebrow="KAYNAK DURUMLU EŞYA KATALOĞU" title="Eşya rehberi">
      <div className="catalogTools">
        <input aria-label="Eşya ara" value={query} onChange={(event) => { setQuery(event.target.value); setItemVisibleLimit(24); }} placeholder="Eşya, sınıf veya yuva…" />
        <select aria-label="Sınıfa göre filtrele" value={classFilter} onChange={(event) => { setClassFilter(event.target.value); setItemVisibleLimit(24); setCompareIds([]); setNotice(""); }}>
          <option>Tümü</option>
          {classes.map((itemClass) => <option key={itemClass}>{itemClass}</option>)}
        </select>
        <select aria-label="Yuvaya göre filtrele" value={slotFilter} onChange={(event) => { setSlotFilter(event.target.value); setItemVisibleLimit(24); setCompareIds([]); setNotice(""); }}>
          <option>Tümü</option>
          {[...new Set(publishableItems.map((item) => item.slot))].map((slot) => <option key={slot}>{slot}</option>)}
        </select>
      </div>
    </Title>
    <details className="catalogAuditDisclosure"><summary>Doğrulama notunu aç <i>+</i></summary><p><b>“Tek kaynak” etiketi kesin bilgi anlamına gelmez.</b> Bu kayıtlar ikinci bağımsız kaynak veya aynı eşya adını gösteren oyun içi ekran görüntüsü gelene kadar teyit bekler; çelişkili değerler hesaplara alınmaz. Çemberlitaş adları resmî eşya listeleriyle, Sığınaklar ve Migrat adları sınıf ganimet tablolarıyla karşılaştırıldı. “Farabi Modeli Farabi Modeli” gibi tekrarlar kaynakta çift efsunu ifade ettiği için otomatik olarak silinmez.</p></details>
    <p className="visualFamilyPolicy"><b>Tekrarsız görsel sistemi:</b> {publishableItems.length} eşya, {itemFamilyInventory.length} görünüş ailesine bağlandı. Her gövde için bir görsel yeterli; efsun ve özellikler eşya kaydında ayrı kalır.</p>
    <p className="resultCount">{visibleItems.length}/{filtered.length} eşya gösteriliyor · Aynı sınıf ve yuvadan iki eşyayı karşılaştırabilirsin.</p>
    {notice && <p className="notice">{notice}</p>}
    {compareItems.length > 0 && <ComparePanel items={compareItems} clear={() => { setCompareIds([]); setNotice(""); }} />}
    <div className="cards">
      {visibleItems.map((item) => <ItemCard item={item} compared={compareIds.includes(item.id)} onCompare={toggleCompare} onOpen={setDetail} key={item.id} />)}
    </div>
    {visibleItems.length < filtered.length && <button className="catalogMore" type="button" onClick={() => setItemVisibleLimit((value) => value + 24)}>24 eşya daha göster <span>{filtered.length - visibleItems.length} kaldı</span></button>}
    {filtered.length === 0 && <p className="emptyResult">Bu filtrelerle eşleşen kaynaklı eşya yok.</p>}
    {detail && <ItemModal item={detail} close={closeDetail} />}
  </section>;
}
