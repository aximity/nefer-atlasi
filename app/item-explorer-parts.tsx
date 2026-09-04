"use client";

import Image from "next/image";
import Link from "next/link";
import {
  itemEvidence,
  itemRecipe,
  itemStats,
  itemStatusLabel,
  publishableItems,
  publishableStats,
  sourceFor,
  type Item,
} from "../lib/catalog";
import {
  cemberlitasBossesFor,
  cemberlitasLootSourceIdFor,
  isCemberlitasRecipe,
} from "../lib/group-region-loot.mjs";
import { itemVisualAssetFor } from "../lib/item-visuals";
import {
  isSharedItemVisualFamily,
  itemVisualFamilyFor,
  itemVisualFamilyInventory,
} from "../lib/visual-families";

const fmt = (value: number) => new Intl.NumberFormat("tr-TR").format(value);
const itemFamilySize = new Map(
  itemVisualFamilyInventory(publishableItems).map(({ family, items }) => [family.id, items.length]),
);

export function ItemCard({
  item,
  onOpen,
  onCompare,
  compared,
}: {
  item: Item;
  onOpen: (item: Item) => void;
  onCompare: (item: Item) => void;
  compared: boolean;
}) {
  const visual = itemVisualAssetFor(item),
    visualFamily = itemVisualFamilyFor(item),
    appearanceLike = visual?.kind === "set_appearance" || visual?.kind === "shared_item_type";
  return (
    <article className={`card ${visual ? "withArt" : "dataOnly"}`}>
      <button className="cardOpen" onClick={() => onOpen(item)}>
        {visual && (
          <div className={`art ${appearanceLike ? "appearanceArt" : "verifiedArt"} ${visual.kind === "item_icon" ? "itemIconArt" : ""}`}>
            <Image
              src={visual.url}
              alt={visual.alt}
              width={visual.width}
              height={visual.height}
              unoptimized={visual.unoptimized}
              style={visual.focus ? { objectPosition: visual.focus, width: "100%", height: "100%", objectFit: "cover" } : undefined}
            />
            <small>{visual.label}</small>
          </div>
        )}
        <div className="copy">
          <p>
            {item.class} · {item.slot}
            <b>{item.rarity.toUpperCase()}</b>
          </p>
          <h3>{item.name}</h3>
          {isSharedItemVisualFamily(visualFamily) && <span className="visualFamilyChip">ORTAK GÖVDE · {visualFamily.label}</span>}
          <span className="cardHint">Kaynak ve ayrıntıyı aç →</span>
          <footer>
            ● {itemStatusLabel(item.id, item.publicationStatus)} · {item.lastChecked}
          </footer>
        </div>
      </button>
      <button
        className={`compareButton ${compared ? "on" : ""}`}
        onClick={() => onCompare(item)}
      >
        {compared ? "Karşılaştırmadan çıkar" : "Karşılaştır"}
      </button>
    </article>
  );
}

export function ComparePanel({
  items: compared,
  clear,
}: {
  items: Item[];
  clear: () => void;
}) {
  const attributes = [
    ...new Set(
      compared.flatMap((item) =>
        publishableStats(item.id).map((stat) => stat.attribute),
      ),
    ),
  ];
  return (
    <section className="comparePanel" aria-label="Eşya karşılaştırma">
      <header>
        <div>
          <small>HIZLI KARŞILAŞTIRMA</small>
          <h3>{compared.map((i) => i.name).join(" ↔ ")}</h3>
        </div>
        <button onClick={clear}>Temizle</button>
      </header>
      <div className="compareGrid">
        <b>Özellik</b>
        {compared.map((item) => (
          <b key={item.id}>{item.name}</b>
        ))}
        {attributes.map((attribute) => (
          <div className="compareRow" key={attribute}>
            <span>{attribute}</span>
            {compared.map((item) => {
              const matching = publishableStats(item.id).filter((stat) => stat.attribute === attribute);
              return <strong key={item.id}>{matching.length ? fmt(matching.reduce((sum, stat) => sum + stat.value, 0)) : "—"}</strong>;
            })}
          </div>
        ))}
      </div>
      {compared.length < 2 && <p>Aynı sınıf ve yuvadan ikinci eşyayı seç.</p>}
    </section>
  );
}

export function ItemModal({ item, close }: { item: Item; close: () => void }) {
  const recipe = itemRecipe(item.id),
    usable = publishableStats(item.id),
    hasConflict = itemStats(item.id).some((stat) => stat.verificationStatus === "conflicted"),
    claims = itemEvidence(item.id),
    source = sourceFor(claims[0]?.sourceId),
    recipeSource = recipe ? sourceFor(recipe.sourceId) : undefined,
    visual = itemVisualAssetFor(item),
    visualSource = visual ? sourceFor(visual.sourceId) : undefined,
    visualFamily = itemVisualFamilyFor(item),
    visualFamilyCount = itemFamilySize.get(visualFamily.id) ?? 1,
    cemberlitasOrigin = isCemberlitasRecipe(recipe),
    cemberlitasBosses = cemberlitasOrigin ? cemberlitasBossesFor(item) : [],
    lootSource = cemberlitasOrigin ? sourceFor(cemberlitasLootSourceIdFor(item) ?? "") : undefined;
  return (
    <div
      className="modal"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <article>
        <button aria-label="Kapat" className="close" onClick={close}>
          ×
        </button>
        {visual && (
          <div className={`art ${visual.kind === "set_appearance" || visual.kind === "shared_item_type" ? "appearanceArt modalAppearanceArt" : "verifiedArt"} ${visual.kind === "item_icon" ? "itemIconArt" : ""}`}>
            <Image
              src={visual.url}
              alt={visual.alt}
              width={visual.width}
              height={visual.height}
              unoptimized={visual.unoptimized}
              style={visual.focus ? { objectPosition: visual.focus, width: "100%", height: "100%", objectFit: "cover" } : undefined}
            />
            <small>{visual.label}</small>
          </div>
        )}
        <p className="eyebrow">
          {item.class} · {item.slot} · {item.rarity}
        </p>
        <h2>{item.name}</h2>
        <dl>
          <div>
            <dt>Görünüş ailesi</dt>
            <dd>{visualFamily.label} · {visualFamilyCount} kayıt</dd>
          </div>
          {isSharedItemVisualFamily(visualFamily) && (
            <div>
              <dt>Ortak gövde kuralı</dt>
              <dd>Bu görünüş {visualFamily.label} gövdesini temsil eder; efsun, seviye ve özellikler seçili eşya kaydına aittir.</dd>
            </div>
          )}
          {visual && !visual.exactItem && (
            <div>
              <dt>Görsel kapsamı</dt>
              <dd>{visual.family.label} ortak görünüşü; bu eşyanın tekil simgesi veya tooltip kanıtı değildir.</dd>
            </div>
          )}
          <div>
            <dt>Kanıt kapsamı</dt>
            <dd>{claims.length} alan bazlı kayıt</dd>
          </div>
          {usable.length > 0 && <div>
            <dt>Özellikler</dt>
            <dd className="modalStats">{usable.map((stat) => <span key={stat.id}>◆ {stat.attribute}: {fmt(stat.value)}</span>)}{hasConflict && <em>⚠ Çelişkili özellikler hesap dışı</em>}</dd>
          </div>}
          {item.level && (
            <div>
              <dt>Seviye</dt>
              <dd>{item.level}</dd>
            </div>
          )}
          {(item.region || cemberlitasOrigin) && (
            <div>
              <dt>Ganimet</dt>
              <dd>
                {item.region ?? "Çemberlitaş"} · {item.boss ?? cemberlitasBosses.join(", ")}
              </dd>
            </div>
          )}
          {item.acquisition && (
            <div>
              <dt>Elde etme</dt>
              <dd>{item.acquisition}</dd>
            </div>
          )}
          {recipe && (
            <>
              <div>
                <dt>Elde etme</dt>
                <dd>{recipe.method}</dd>
              </div>
              <div>
                <dt>Reçete</dt>
                <dd><a className="modalRecipeLink" href={`/?module=recipes&kind=item&recipe=${item.id}#recipes`}>{recipe.materials.length} malzemeli reçeteyi aç →</a></dd>
              </div>
            </>
          )}
        </dl>
        {(source || recipeSource || lootSource || visualSource) && <Link className="sourceLink" href="/kaynaklar#esyalar">Eşya, reçete ve görünüş kaynaklarını gör →</Link>}
        <a className="sourceLink secondary" href={`/?module=atlas&node=${encodeURIComponent(`item:${item.id}`)}#atlas`}>Eşyanın bağlantılı atlasını aç ↗</a>
      </article>
    </div>
  );
}
