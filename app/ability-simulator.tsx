"use client";

import { useEffect, useMemo, useState } from "react";
import type { CharacterClass } from "../lib/catalog";
import abilityRows from "../data/abilities.json";
import detailRows from "../data/ability-details.json";
import abilityVariantRows from "../data/ability-variants.json";

type PointMap = Record<string, number>;
type Plan = {
  klass: CharacterClass;
  level: number;
  extraFive: boolean;
  points: PointMap;
};

const classes: CharacterClass[] = ["Savaşçı", "Büyücü", "Şifacı"];
const maxLevel = 49;
const bearVariant = abilityVariantRows.find(
  (variant) => variant.replacesAbilityId === "warrior-bleed",
);
const detailByAbility = Object.fromEntries(
  detailRows.map((detail) => [detail.abilityId, detail]),
);
const presets: Record<
  CharacterClass,
  { name: string; points: PointMap; note: string }[]
> = {
  Büyücü: [
    {
      name: "Sığınak başlangıcı",
      points: { "mage-tesla": 1 },
      note: "Tesla Küresi 1 puanla başlar; kalan puanlar grup rolüne göre dağıtılır.",
    },
  ],
  Şifacı: [
    {
      name: "Tek şifacı başlangıcı",
      points: { "healer-dispel": 1, "healer-heal-circle": 1 },
      note: "Büyü Bozma ve İyileştirme Çemberi için birer puanlık başlangıçtır; zorunlu meta değildir.",
    },
    {
      name: "İki şifacı · element",
      points: { "healer-element-field": 15, "healer-dispel": 1 },
      note: "Diğer şifacı Fiziksel Direnç Alanını üstlenirse rol paylaşımı yapılabilir.",
    },
  ],
  Savaşçı: [
    {
      name: "Sığınak savunması",
      points: {
        "warrior-steadfast": 15,
        "warrior-taunt": 1,
        "warrior-shout": 15,
      },
      note: "Sarsılmaz, Kışkırtma ve Savaş Narası odaklı savunma başlangıcıdır.",
    },
    {
      name: "Çemberlitaş zihin direnci",
      points: {
        "warrior-focus": 15,
        "warrior-steadfast": 15,
        "warrior-taunt": 1,
      },
      note: "Korteks ve Ayartma etkileri için Zihin Toplama 15'i öne çıkarır.",
    },
  ],
};

const pointBudget = (level: number, extraFive: boolean) =>
  Math.max(0, (Math.min(maxLevel, Math.max(1, level)) - 1) * 2) +
  (extraFive ? 5 : 0);

function progressionThreshold(line: string) {
  if (/Her puan|Yaratıklara karşı|açıkken|mod açıksa|hedefe vurduğunda/i.test(line)) return 1;
  const match = line.match(/(^|\s)(1|5|10|15)\s*(?:\/\s*\d+\s*)*(?:puanda|puandan|puan)/i);
  return match ? Number(match[2]) : 1;
}

function normalizePoints(
  input: PointMap,
  klass: CharacterClass,
  level: number,
  budget: number,
) {
  const rows = abilityRows.filter((ability) => ability.class === klass);
  const next: PointMap = {};
  let used = 0;
  for (const ability of rows) {
    if (ability.unlockLevel > level || used >= budget) continue;
    const requested = Math.max(0, Math.min(15, Number(input[ability.id]) || 0));
    const allowed = Math.min(requested, budget - used);
    if (allowed) next[ability.id] = allowed;
    used += allowed;
  }
  return next;
}

function safePlan(value: unknown): Plan | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Partial<Plan>;
  if (!classes.includes(input.klass as CharacterClass)) return null;
  const level = Math.min(maxLevel, Math.max(1, Number(input.level) || maxLevel));
  const extraFive = Boolean(input.extraFive);
  const points = normalizePoints(
    input.points && typeof input.points === "object" ? input.points : {},
    input.klass as CharacterClass,
    level,
    pointBudget(level, extraFive),
  );
  return { klass: input.klass as CharacterClass, level, extraFive, points };
}

export default function AbilitySimulator({
  klass,
  onClassChange,
}: {
  klass: CharacterClass;
  onClassChange: (klass: CharacterClass) => void;
}) {
  const [levelText, setLevelText] = useState("49");
  const [levelValue, setLevelValue] = useState(49);
  const [points, setPoints] = useState<PointMap>({});
  const [presetName, setPresetName] = useState("");
  const [extraFive, setExtraFive] = useState(false);
  const [notice, setNotice] = useState("");
  const level = levelValue;
  const budget = pointBudget(level, extraFive);
  const spent = useMemo(
    () => Object.values(points).reduce((sum, value) => sum + value, 0),
    [points],
  );
  const remaining = budget - spent;
  const classAbilities = abilityRows.filter((ability) => ability.class === klass);
  const selectedPreset = presets[klass].find((item) => item.name === presetName);

  useEffect(() => {
    const hydrate = () => {
      const params = new URLSearchParams(location.search);
      const shared = params.get("skillPlan");
      if (!shared) return;
      try {
        const plan = safePlan(JSON.parse(shared));
        if (!plan) throw new Error("invalid");
        onClassChange(plan.klass);
        setLevelText(String(plan.level));
        setLevelValue(plan.level);
        setExtraFive(plan.extraFive);
        setPoints(plan.points);
        setNotice("Paylaşılan yetenek planı yüklendi.");
      } catch {
        setNotice("Bağlantıdaki yetenek planı okunamadı.");
      }
    };
    queueMicrotask(hydrate);
    // Paylaşım bağlantısı yalnız ilk açılışta okunur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeClass = (next: CharacterClass) => {
    onClassChange(next);
    setPoints({});
    setPresetName("");
    setNotice(`${next} için boş plan açıldı.`);
  };
  const changeLevel = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    setLevelText(digits);
    if (!digits) return;
    const nextLevel = Math.min(maxLevel, Math.max(1, Number(digits)));
    setLevelValue(nextLevel);
    const nextBudget = pointBudget(nextLevel, extraFive);
    setPoints(normalizePoints(points, klass, nextLevel, nextBudget));
    setPresetName("");
  };
  const changeExtra = (checked: boolean) => {
    setExtraFive(checked);
    setPoints(
      normalizePoints(points, klass, level, pointBudget(level, checked)),
    );
  };
  const setAbilityPoints = (abilityId: string, requested: number) => {
    const current = points[abilityId] ?? 0;
    const allowed = Math.min(
      15,
      Math.max(0, requested),
      current + remaining,
    );
    setPoints({ ...points, [abilityId]: allowed });
    setPresetName("");
    setNotice("");
  };
  const applyPreset = (name: string) => {
    const preset = presets[klass].find((item) => item.name === name);
    setPresetName(name);
    setPoints(
      normalizePoints(preset?.points ?? {}, klass, level, budget),
    );
    setNotice(preset ? `${preset.name} şablonu uygulandı.` : "Boş plan açıldı.");
  };
  const currentPlan: Plan = { klass, level, extraFive, points };
  const share = async () => {
    try {
      const url = new URL(location.href);
      url.searchParams.set("module", "skills");
      url.searchParams.set("skillPlan", JSON.stringify(currentPlan));
      await navigator.clipboard.writeText(url.toString());
      history.replaceState(null, "", url);
      setNotice("Yetenek planı bağlantısı kopyalandı.");
    } catch {
      setNotice("Bağlantı kopyalanamadı.");
    }
  };
  const save = () => {
    localStorage.setItem("ko-ability-plan-v1", JSON.stringify(currentPlan));
    setNotice("Yetenek planı bu cihazda kaydedildi.");
  };
  const load = () => {
    try {
      const raw = localStorage.getItem("ko-ability-plan-v1");
      const plan = safePlan(raw ? JSON.parse(raw) : null);
      if (!plan) throw new Error("missing");
      onClassChange(plan.klass);
      setLevelText(String(plan.level));
      setLevelValue(plan.level);
      setExtraFive(plan.extraFive);
      setPoints(plan.points);
      setPresetName("");
      setNotice("Kayıtlı yetenek planı yüklendi.");
    } catch {
      setNotice("Bu cihazda geçerli bir yetenek planı yok.");
    }
  };

  return (
    <section className={`abilitySimulator ${klass === "Savaşçı" ? "warrior" : klass === "Büyücü" ? "mage" : "healer"}`}>
      <div className="abilityHead">
        <div>
          <small>BAĞIMSIZ YETENEK SİMÜLATÖRÜ</small>
          <h3>{klass} puan planı</h3>
          <p>Seviyeni seç, açılan yeteneklere 0–15 puan dağıt ve o puanda etkinleşen sonuçları gör.</p>
        </div>
        <div className="abilityBudget">
          <strong>{remaining}</strong>
          <span>kalan puan</span>
          <small>{spent}/{budget} kullanıldı</small>
        </div>
      </div>

      <div className="abilityClassPicker" aria-label="Yetenek sınıfı">
        {classes.map((item) => (
          <button
            type="button"
            className={klass === item ? "active" : ""}
            onClick={() => changeClass(item)}
            key={item}
          >
            {item}<small>15 yetenek</small>
          </button>
        ))}
      </div>

      <div className="abilityControls">
        <label className="abilityLevelInput">
          <span>Karakter seviyesi</span>
          <input
            aria-label="Karakter seviyesi"
            inputMode="numeric"
            value={levelText}
            placeholder="1–49"
            onChange={(event) => changeLevel(event.target.value)}
            onBlur={() => setLevelText(String(level))}
          />
          <small>{level - 1} seviye artışı × 2 = {(level - 1) * 2} puan</small>
        </label>
        <label className="abilityBonusToggle">
          <input
            type="checkbox"
            checked={extraFive}
            onChange={(event) => changeExtra(event.target.checked)}
          />
          <span><b>Ek +5 yetenek hakkı</b><small>Karakterinde bu hak gerçekten açıksa kullan.</small></span>
        </label>
        <label className="presetSelect">
          <span>Hazır başlangıç</span>
          <select value={presetName} onChange={(event) => applyPreset(event.target.value)}>
            <option value="">Boş plan</option>
            {presets[klass].map((preset) => <option key={preset.name}>{preset.name}</option>)}
          </select>
        </label>
        <div className="abilityActions">
          <button onClick={share}>Bağlantıyı kopyala</button>
          <button onClick={save}>Kaydet</button>
          <button onClick={load}>Yükle</button>
          <button onClick={() => { setPoints({}); setPresetName(""); setNotice("Plan sıfırlandı."); }}>Sıfırla</button>
        </div>
      </div>

      {selectedPreset && <p className="presetNote">{selectedPreset.note}</p>}
      {notice && <p className="abilityNotice" role="status">{notice}</p>}

      <div className="abilityPlanSummary">
        <span><b>{classAbilities.filter((ability) => ability.unlockLevel <= level).length}</b> açık yetenek</span>
        <span><b>{Object.values(points).filter(Boolean).length}</b> puan verilmiş yetenek</span>
        <span><b>{budget}</b> toplam bütçe</span>
        <p>Seviye düşürüldüğünde kilitlenen veya bütçeyi aşan puanlar otomatik geri alınır.</p>
      </div>

      <div className="abilityCards">
        {classAbilities.map((ability) => {
          const locked = ability.unlockLevel > level;
          const value = points[ability.id] ?? 0;
          const isBear = ability.id === "warrior-bleed" && bearVariant;
          const detail = isBear ? bearVariant : detailByAbility[ability.id];
          const displayName = isBear ? bearVariant.name : ability.name;
          const activeLines = detail?.progression.filter(
            (line) => value > 0 && progressionThreshold(line) <= value,
          ) ?? [];
          const nextLines = detail?.progression
            .filter((line) => progressionThreshold(line) > value)
            .sort((a, b) => progressionThreshold(a) - progressionThreshold(b)) ?? [];
          const nextLine = nextLines[0];
          return (
            <article className={`abilityPointCard ${locked ? "locked" : ""} ${value ? "allocated" : ""}`} key={ability.id}>
              <header>
                <span>SV. {ability.unlockLevel}</span>
                <div>
                  <h4>{displayName}</h4>
                  <small>{ability.roles.join(" · ")}</small>
                </div>
                <output>{value}<small>/15</small></output>
              </header>
              {isBear && <p className="abilityServerVariant">KÖ&apos;de Kanatma yuvasının yerine geçer; aynı puanı kullanır.</p>}
              <p className="abilityEffect">{detail?.effect ?? "Ayrıntılı oyun içi açıklama doğrulanıyor."}</p>
              <div className="abilityStepper" aria-label={`${displayName} puanı`}>
                <button disabled={locked || value === 0} onClick={() => setAbilityPoints(ability.id, value - 1)} aria-label={`${displayName} bir puan azalt`}>−</button>
                {[0, 5, 10, 15].map((target) => (
                  <button
                    className={value === target ? "active" : ""}
                    disabled={locked || (target > value + remaining)}
                    onClick={() => setAbilityPoints(ability.id, target)}
                    key={target}
                  >{target}</button>
                ))}
                <button disabled={locked || value === 15 || remaining === 0} onClick={() => setAbilityPoints(ability.id, value + 1)} aria-label={`${displayName} bir puan artır`}>＋</button>
              </div>
              {locked ? (
                <p className="abilityLocked">{ability.unlockLevel}. seviyede açılır.</p>
              ) : value === 0 ? (
                <p className="abilityNext">Puan verildiğinde temel etki açılır.</p>
              ) : (
                <div className="abilityCurrent">
                  <small>{value} PUANDA ETKİN</small>
                  <ul>{activeLines.map((line) => <li key={line}>{line}</li>)}</ul>
                  {nextLine && <p><b>Sonraki eşik · {progressionThreshold(nextLine)} puan:</b> {nextLine}</p>}
                </div>
              )}
              {detail?.evidenceImage && (
                <a href={detail.evidenceImage} target="_blank" rel="noreferrer">Oyun içi kaynak görüntüsü ↗</a>
              )}
            </article>
          );
        })}
      </div>

      <footer className="abilityAudit">
        <div>
          <b>{remaining === 0 ? "Puan planı tamamlandı" : `${remaining} puan henüz dağıtılmadı`}</b>
          <span>Hesap yalnız puan sınırını ve kaynaklı eşikleri gösterir; hasar sonucu eşya, direnç ve hedefe göre ayrıca değişir.</span>
        </div>
        <a href="https://istanbuloyun.com/AbilitySystem.aspx" target="_blank" rel="noreferrer">Yetenek puanı kuralı ↗</a>
      </footer>
    </section>
  );
}
