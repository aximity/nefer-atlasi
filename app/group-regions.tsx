"use client";

import { useState } from "react";
import { publishableItems, itemRecipe, type Item } from "../lib/catalog";
import {
  GROUP_REGION_DEFINITIONS,
  cemberlitasBossesFor,
  isCemberlitasRecipe,
} from "../lib/group-region-loot.mjs";
import Title from "./section-title";

const classes = ["Savaşçı", "Büyücü", "Şifacı"];

export default function GroupRegions({ onOpen, initialRegionName = "", initialBossName = "" }: { onOpen: (item: Item) => void; initialRegionName?: string; initialBossName?: string }) {
  const cemberlitasLoot = publishableItems
      .filter(
        (item) => isCemberlitasRecipe(itemRecipe(item.id)),
      )
      .map((item) => ({
        ...item,
        region: "Çemberlitaş",
        bosses: cemberlitasBossesFor(item),
        acquisition: itemRecipe(item.id)?.method,
      })),
    loot = [
      ...cemberlitasLoot,
      ...publishableItems
        .filter((item) => item.region && item.boss)
        .map((item) => ({ ...item, region: item.region as string, bosses: [item.boss as string] })),
    ],
    regions = GROUP_REGION_DEFINITIONS.filter((region) => loot.some((item) => item.region === region.name)),
    [activeRegion, setActiveRegion] = useState(
      regions.find((region) => region.name === initialRegionName) ?? regions[0] ?? GROUP_REGION_DEFINITIONS[0],
    ),
    [activeClass, setActiveClass] = useState("Tümü"),
    visible = loot.filter(
      (item) =>
        item.region === activeRegion.name &&
        (activeClass === "Tümü" || item.class === activeClass),
    );

  return (
    <section className="groupRegions" id="group-regions">
      <Title
        eyebrow="M4 · GRUP BÖLGELERİ GANİMET ARŞİVİ"
        title="Hangi boss ne atıyor?"
      >
        <span className="count">{loot.length} kaynaklı ganimet ve üretim kaydı</span>
      </Title>
      <div className="regionTabs" role="tablist" aria-label="Grup bölgesi seç">
        {regions.map((region) => (
          <button
            role="tab"
            aria-selected={activeRegion.name === region.name}
            className={activeRegion.name === region.name ? "on" : ""}
            onClick={() => setActiveRegion(region)}
            key={region.name}
          >
            <span>{region.name}</span>
            <small>
              {loot.filter((item) => item.region === region.name).length} eşya · {region.bossCount} boss
              {region.encounterCount !== region.bossCount ? ` · ${region.encounterCount} karşılaşma` : ""}
            </small>
          </button>
        ))}
      </div>
      <div className="lootClassFilter" aria-label="Sınıfa göre filtrele">
        {["Tümü", ...classes].map((className) => (
          <button
            className={activeClass === className ? "on" : ""}
            onClick={() => setActiveClass(className)}
            key={className}
          >
            {className}
          </button>
        ))}
      </div>
      <div className="bossLootGrid">
        {[...activeRegion.bossGroups].sort((a, b) => Number(b.name === initialBossName || b.lootBosses.includes(initialBossName)) - Number(a.name === initialBossName || a.lootBosses.includes(initialBossName))).map((boss, bossIndex) => {
          const drops = visible.filter((item) => item.bosses.some((itemBoss) => boss.lootBosses.includes(itemBoss)));
          const focused = boss.name === initialBossName || boss.lootBosses.includes(initialBossName);
          return (
            <article className={focused ? "bossLoot focused" : "bossLoot"} key={boss.name}>
              <header>
                <div className="bossMark">{String(bossIndex + 1).padStart(2, "0")}</div>
                <div>
                  <small>{boss.stage}{boss.encounters > 1 ? ` · ${boss.encounters} KARŞILAŞMA` : ""}</small>
                  <h3>{boss.name}</h3>
                </div>
                <b>{drops.length} parça</b>
              </header>
              <div className="dropList">
                {drops.map((item) => (
                  <button onClick={() => onOpen(item)} key={item.id}>
                    <span>
                      <small>{item.class}</small>
                      <strong>{item.name}</strong>
                      {item.acquisition && <i>{item.acquisition}</i>}
                    </span>
                    <em>{item.slot}</em>
                  </button>
                ))}
                {!drops.length && <p className="bossLootEmpty">Bu boss için kaynakta eşya ganimeti listelenmiyor.</p>}
              </div>
            </article>
          );
        })}
      </div>
      {!activeRegion.bossGroups.length && (
        <p className="emptyResult">Bu sınıf için kayıtlı ganimet yok.</p>
      )}
    </section>
  );
}
