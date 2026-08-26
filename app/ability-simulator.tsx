"use client";

import { useMemo, useState } from "react";
import type { CharacterClass } from "../lib/catalog";
import abilityRows from "../data/abilities.json";
import abilityVariantRows from "../data/ability-variants.json";

const baseBudget = 96;
const variantByBaseAbility = Object.fromEntries(
  abilityVariantRows.map((variant) => [variant.replacesAbilityId, variant]),
);
const abilities = Object.fromEntries(
  (["Savaşçı", "Büyücü", "Şifacı"] as CharacterClass[]).map((klass) => [
    klass,
    abilityRows
      .filter((row) => row.class === klass)
      .map((row) => ({
        id: row.id,
        name: row.name,
        note: `Seviye ${row.unlockLevel} · KÖ sunucu rehberi`,
      })),
  ]),
) as Record<CharacterClass, { id: string; name: string; note: string }[]>;
const presets: Record<
  CharacterClass,
  { name: string; points: Record<string, number>; note: string }[]
> = {
  Büyücü: [
    {
      name: "Sığınak başlangıcı",
      points: { "Tesla Küresi": 1 },
      note: "Rehber Tesla Küresi için 1 puanı yeterli başlangıç olarak veriyor; kalan puanlar grup rolüne göre dağıtılır.",
    },
  ],
  Şifacı: [
    {
      name: "Tek şifacı başlangıcı",
      points: { "Büyü Bozma": 1, "İyileştirme Çemberi": 1 },
      note: "Rehber Büyü Bozma için 1 puanı genel kullanımda yeterli, İyileştirme Çemberi 1'i kriz alternatifi olarak gösteriyor.",
    },
    {
      name: "İki şifacı · element",
      points: { "Element Direnç Alanı": 15, "Büyü Bozma": 1 },
      note: "Diğer şifacı Fiziksel Direnç Alanını üstlenmelidir.",
    },
  ],
  Savaşçı: [
    {
      name: "Sığınak savunması",
      points: { Sarsılmaz: 15, Kışkırtma: 1, "Savaş Narası": 15 },
      note: "Rehberdeki açık alternatiflerden biridir; grup stratejisine göre Kışkırtma 15 / Savaş Narası 1 ters dağılımı da seçilebilir.",
    },
    {
      name: "Çemberlitaş zihin direnci",
      points: { "Zihin Toplama": 15, Sarsılmaz: 15, Kışkırtma: 1 },
      note: "Korteks ve Ayartma etkileri için rehber Zihin Toplama 15'i önemli görüyor.",
    },
  ],
};

export default function AbilitySimulator({ klass }: { klass: CharacterClass }) {
  const [points, setPoints] = useState<Record<string, number>>({});
  const [presetName, setPresetName] = useState("");
  const [extraFive, setExtraFive] = useState(false);
  const spent = useMemo(
      () => Object.values(points).reduce((a, b) => a + b, 0),
      [points],
    ),
    budget = baseBudget + (extraFive ? 5 : 0),
    remaining = budget - spent;
  const set = (name: string, value: number) => {
    const current = points[name] ?? 0,
      next = Math.max(0, Math.min(15, value)),
      without = spent - current;
    setPoints({ ...points, [name]: Math.min(next, budget - without) });
    setPresetName("");
  };
  const applyPreset = (name: string) => {
    const preset = presets[klass].find((x) => x.name === name);
    setPresetName(name);
    setPoints(preset?.points ?? {});
  };
  const selectedPreset = presets[klass].find((x) => x.name === presetName);
  return (
    <section className="abilitySimulator">
      <div className="abilityHead">
        <div>
          <small>YETENEK SİMÜLASYONU</small>
          <h3>{klass} puan planı</h3>
        </div>
        <strong className={remaining < 0 ? "over" : ""}>
          {spent}/{budget}
          <span> · kalan {remaining}</span>
        </strong>
      </div>
      <div className="budgetProof">
        <p>
          <b>49. seviye güncel web kuralı hesabı:</b> 48 seviye artışı × 2
          puan = 96.
        </p>
        <label>
          <input
            type="checkbox"
            checked={extraFive}
            disabled={extraFive && spent > baseBudget}
            onChange={(event) => setExtraFive(event.target.checked)}
          />
          Resmî İKV +5 yetenek hakkını ekle
        </label>
        <small>
          Güncel resmî web sayfası seviye başına 2 puan, eski 6.0 PDF rehberi
          ise 1 puan yazar. Bu hak açıkken toplam 101 olur. Kıyametin Öncüleri
          hesabındaki toplamı oyun içinden teyit et.
        </small>
        <div>
          <a href="https://istanbuloyun.com/AbilitySystem.aspx" target="_blank" rel="noreferrer">2 puan / seviye kaynağı ↗</a>
          <a href="https://download.istanbuloyun.com/ikv_oyun_rehberi.pdf" target="_blank" rel="noreferrer">Eski 6.0 rehberi · 1 puan / seviye ↗</a>
          <a href="https://istanbuloyun.com/cemberlitasikvbox.aspx" target="_blank" rel="noreferrer">+5 puan kaynağı ↗</a>
          <a href="https://kiyametoyun.net/rehber" target="_blank" rel="noreferrer">KÖ yetenek listesi ↗</a>
        </div>
      </div>
      <aside className="abilityVariantNote">
        <b>15 temel yetenek:</b> Boz Ayı ayrı bir 16. yetenek değildir; resmî
        oyun rehberinde Kanatma&apos;nın yerine geçen ve aynı puanı kullanan
        varyant olarak açıklanır.
        <a
          href="https://download.istanbuloyun.com/ikv_oyun_rehberi.pdf"
          target="_blank"
          rel="noreferrer"
        >
          Resmî oyun rehberi · sayfa 17 ↗
        </a>
      </aside>
      <label className="presetSelect">
        <span>Topluluk rehberi başlangıcı</span>
        <select
          value={presetName}
          onChange={(e) => applyPreset(e.target.value)}
        >
          <option value="">Boş plan</option>
          {presets[klass].map((x) => (
            <option key={x.name}>{x.name}</option>
          ))}
        </select>
      </label>
      {selectedPreset && <p className="presetNote">{selectedPreset.note}</p>}
      <div className="abilityRows">
        {abilities[klass].map((ability) => (
          <label key={ability.name}>
            <span>
              <b>{ability.name}</b>
              <small>{ability.note}</small>
              {variantByBaseAbility[ability.id] && (
                <small className="variantTag">
                  {variantByBaseAbility[ability.id].name} varyantı aynı puanı
                  kullanır
                </small>
              )}
            </span>
            <input
              aria-label={`${ability.name} puanı`}
              type="range"
              min="0"
              max="15"
              value={points[ability.name] ?? 0}
              onChange={(e) => set(ability.name, Number(e.target.value))}
            />
            <output>{points[ability.name] ?? 0}/15</output>
          </label>
        ))}
      </div>
      <div className="abilityAudit">
        <b>
          {remaining === 0
            ? "Puan planı tamamlandı"
            : `${remaining} puan henüz dağıtılmadı`}
        </b>
        <span>
          Her yetenek en fazla 15 puan. Şablonlar topluluk rehberindeki açık
          önerileri başlangıç noktası olarak doldurur; zorunlu veya resmî meta değildir.
        </span>
        <button
          onClick={() => {
            setPoints({});
            setPresetName("");
          }}
        >
          Planı sıfırla
        </button>
      </div>
    </section>
  );
}
