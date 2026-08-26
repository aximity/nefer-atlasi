"use client";

import { useMemo, useState } from "react";
import abilityRows from "../data/abilities.json";
import detailRows from "../data/ability-details.json";
import variantRows from "../data/ability-variants.json";

type AbilityClass = "Savaşçı" | "Büyücü" | "Şifacı";

const classes: AbilityClass[] = ["Savaşçı", "Büyücü", "Şifacı"];

export default function AbilityReference() {
  const [activeClass, setActiveClass] = useState<AbilityClass>("Savaşçı");
  const classAbilities = useMemo(
    () => abilityRows.filter((row) => row.class === activeClass),
    [activeClass],
  );
  const classDetails = useMemo(
    () => detailRows.filter((detail) => classAbilities.some((ability) => ability.id === detail.abilityId)),
    [classAbilities],
  );
  const classVariants = variantRows.filter((variant) => variant.class === activeClass);
  const detailedIds = new Set(classDetails.map((row) => row.abilityId));
  const waiting = classAbilities.filter((row) => !detailedIds.has(row.id));

  return (
    <section className={`healerReference abilityReference ${activeClass === "Savaşçı" ? "warrior" : activeClass === "Büyücü" ? "mage" : "healer"}`} aria-labelledby="ability-reference-title">
      <div className="abilityClassTabs" aria-label="Yetenek sınıfı">
        {classes.map((className) => {
          const count = detailRows.filter((detail) =>
            abilityRows.some((ability) => ability.id === detail.abilityId && ability.class === className),
          ).length;
          return (
            <button
              key={className}
              type="button"
              className={activeClass === className ? "active" : ""}
              onClick={() => setActiveClass(className)}
            >
              <span>{className}</span>
              <small>{count}/15</small>
            </button>
          );
        })}
      </div>

      <div className="healerReferenceHead">
        <div>
          <small>OYUN İÇİ TOOLTIP KANITI</small>
          <h3 id="ability-reference-title">{activeClass} Yetenek Sözlüğü</h3>
        </div>
        <strong>{classDetails.length} / 15</strong>
        <p>
          Kayıtlar oyun içi metinden yapılandırıldı. Her kartın kaynak görüntüsü
          açılabilir; temel yetenek ile yerine geçen varyant ayrı gösterilir.
        </p>
      </div>

      <div className="healerAbilityGrid">
        {classDetails.map((detail) => {
          const ability = abilityRows.find((row) => row.id === detail.abilityId);
          if (!ability) return null;
          return (
            <details className="healerAbilityCard" key={detail.abilityId}>
              <summary>
                <span className="healerAbilityLevel">SV. {ability.unlockLevel}</span>
                <span><b>{ability.name}</b><small>{detail.effect}</small></span>
                <i aria-hidden="true">＋</i>
              </summary>
              <div className="healerAbilityBody">
                <dl>
                  <div><dt>Hedef</dt><dd>{detail.target}</dd></div>
                  <div><dt>Süre</dt><dd>{detail.duration}</dd></div>
                  <div><dt>Yenilenme</dt><dd>{detail.cooldown}</dd></div>
                </dl>
                <ul>{detail.progression.map((line) => <li key={line}>{line}</li>)}</ul>
                <footer>
                  <span>✓ Oyun içi görüntü + KÖ rehberi</span>
                  <a href={detail.evidenceImage} target="_blank" rel="noreferrer">Kaynak görüntüyü aç ↗</a>
                </footer>
              </div>
            </details>
          );
        })}

        {classVariants.map((variant) => {
          const replaced = abilityRows.find((row) => row.id === variant.replacesAbilityId);
          return (
            <details className="healerAbilityCard abilityVariantCard" key={variant.id}>
              <summary>
                <span className="healerAbilityLevel">SV. {replaced?.unlockLevel ?? 20}</span>
                <span>
                  <b>{variant.name} <em>Varyant</em></b>
                  <small>{variant.effect}</small>
                </span>
                <i aria-hidden="true">＋</i>
              </summary>
              <div className="healerAbilityBody">
                <p className="abilityVariantNote">{replaced?.name} yerine geçer ve aynı yetenek puanlarını kullanır.</p>
                <dl>
                  <div><dt>Hedef</dt><dd>{variant.target}</dd></div>
                  <div><dt>Süre</dt><dd>{variant.duration}</dd></div>
                  <div><dt>Yenilenme</dt><dd>{variant.cooldown}</dd></div>
                </dl>
                <ul>{variant.progression.map((line) => <li key={line}>{line}</li>)}</ul>
                <footer>
                  <span>✓ Oyun içi görüntü + resmî rehber + KÖ</span>
                  <a href={variant.evidenceImage} target="_blank" rel="noreferrer">Kaynak görüntüyü aç ↗</a>
                </footer>
              </div>
            </details>
          );
        })}
      </div>

      {waiting.length > 0 ? (
        <div className="healerAbilityWaiting">
          <b>Görsel bekleyen temel yetenekler</b>
          <p>{waiting.map((ability) => ability.name).join(" · ")}</p>
          <small>
            {classVariants.length ? `${classVariants.length} doğrulanmış varyant ayrıca gösteriliyor. ` : ""}
            Okunmayan değer yayımlanmaz; yeni paket geldikçe bu liste otomatik daralır.
          </small>
        </div>
      ) : (
        <div className="healerAbilityWaiting complete">
          <b>{activeClass} sınıfı tamamlandı · 15/15</b>
          <p>Tüm temel {activeClass.toLocaleLowerCase("tr-TR")} yetenekleri oyun içi görüntü ve KÖ rehberiyle kayıtlı.</p>
          <small>Metin farkı görülürse kartın kaynak görüntüsü üzerinden yeniden doğrulanır.</small>
        </div>
      )}
    </section>
  );
}
