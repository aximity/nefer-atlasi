"use client";

import { useEffect, useMemo, useState } from "react";
import {
  classSlots,
  contexts,
  items,
  talismans,
  type CharacterClass,
} from "../lib/catalog";
import {
  buildTotals,
  compatibleItems,
  goalsByClass,
  scoreBuild,
  suggestedSelection,
  type BuildSelection,
  type Goal,
} from "../lib/planner";
import { decodeBuild, encodeBuild, sanitizeBuild } from "../lib/build-codec.mjs";
import Field from "./field";
import Title from "./section-title";

type AbilityKey = "main" | "support" | "defense";

interface BuildSnapshot {
  v: number;
  klass: CharacterClass;
  primary: Goal;
  secondary: Goal | null;
  selection: BuildSelection;
  mode: string;
  regionId: string;
  rival: CharacterClass | "Rakip yok";
  talismanId: string;
  wrathBase: boolean;
  wrathCriticalBase: number;
  abilities: Record<AbilityKey, number>;
}

const classes: CharacterClass[] = ["Savaşçı", "Büyücü", "Şifacı"];
const modes = ["Grup Bölgesi", "PvE", "PvP", "Farm"];
const emptyAbilities: Record<AbilityKey, number> = { main: 0, support: 0, defense: 0 };
const buildRules = {
  classes,
  goalsByClass,
  classSlots,
  itemById: Object.fromEntries(items.map((item) => [item.id, item])),
  modes,
  contextIds: contexts.map((context) => context.id),
  rivals: ["Rakip yok", ...classes],
  talismanById: Object.fromEntries(talismans.map((talisman) => [talisman.id, talisman])),
};
const fmt = (value: number) => new Intl.NumberFormat("tr-TR").format(value);
const readInitialBuild = (code?: string) => {
  if (!code) return { snapshot: null, invalid: false };
  try {
    const snapshot = sanitizeBuild(decodeBuild(code), buildRules) as BuildSnapshot | null;
    return { snapshot, invalid: !snapshot };
  } catch {
    return { snapshot: null, invalid: true };
  }
};

export default function EquipmentBuilder({
  initialClass,
  initialTalismanId,
  initialBuildCode,
  onClassChange,
  onTalismanChange,
}: {
  initialClass: CharacterClass;
  initialTalismanId: string;
  initialBuildCode?: string;
  onClassChange: (klass: CharacterClass) => void;
  onTalismanChange: (talismanId: string) => void;
}) {
  const [initialBuild] = useState(() => readInitialBuild(initialBuildCode));
  const startClass = initialBuild.snapshot?.klass ?? initialClass;
  const defaultPrimary = goalsByClass[startClass][0];
  const defaultSecondary = goalsByClass[startClass][1] ?? null;
  const [klass, setKlass] = useState<CharacterClass>(startClass);
  const [primary, setPrimary] = useState<Goal>(initialBuild.snapshot?.primary ?? defaultPrimary);
  const [secondary, setSecondary] = useState<Goal | null>(initialBuild.snapshot?.secondary ?? defaultSecondary);
  const [selection, setSelection] = useState<BuildSelection>(() =>
    initialBuild.snapshot?.selection ?? suggestedSelection(startClass, defaultPrimary, defaultSecondary),
  );
  const [mode, setMode] = useState(initialBuild.snapshot?.mode ?? "Grup Bölgesi");
  const [regionId, setRegionId] = useState(initialBuild.snapshot?.regionId ?? "cemberlitas");
  const [rival, setRival] = useState<CharacterClass | "Rakip yok">(initialBuild.snapshot?.rival ?? "Rakip yok");
  const [talismanId, setTalismanId] = useState(initialBuild.snapshot?.talismanId ?? initialTalismanId);
  const [wrathBase, setWrathBase] = useState(initialBuild.snapshot?.wrathBase ?? false);
  const [wrathCriticalBase, setWrathCriticalBase] = useState(initialBuild.snapshot?.wrathCriticalBase ?? 0);
  const [abilities, setAbilities] = useState(initialBuild.snapshot?.abilities ?? emptyAbilities);
  const [notice, setNotice] = useState(initialBuild.invalid ? "Bağlantıdaki donanım planı geçersiz veya eski sürüm." : "");

  const applySaved = (snapshot: BuildSnapshot) => {
    setKlass(snapshot.klass);
    setPrimary(snapshot.primary);
    setSecondary(snapshot.secondary);
    setSelection(snapshot.selection);
    setMode(snapshot.mode);
    setRegionId(snapshot.regionId);
    setRival(snapshot.rival);
    setTalismanId(snapshot.talismanId);
    setWrathBase(snapshot.wrathBase);
    setWrathCriticalBase(snapshot.wrathCriticalBase);
    setAbilities(snapshot.abilities);
    onClassChange(snapshot.klass);
    onTalismanChange(snapshot.talismanId);
  };

  useEffect(() => {
    const snapshot = initialBuild.snapshot;
    if (!snapshot) return;
    const timer = setTimeout(() => {
      onClassChange(snapshot.klass);
      onTalismanChange(snapshot.talismanId);
    }, 0);
    return () => clearTimeout(timer);
  }, [initialBuild, onClassChange, onTalismanChange]);

  const totals = useMemo(() => buildTotals(selection), [selection]) as Record<string, number>;
  const score = scoreBuild(selection, primary, secondary);
  const missingSlots = classSlots[klass].filter((slot) => !selection[slot]);
  const payload = {
    klass,
    primary,
    secondary,
    selection,
    mode,
    regionId,
    rival,
    talismanId,
    wrathBase,
    wrathCriticalBase,
    abilities,
  };

  const changeClass = (next: CharacterClass) => {
    const nextPrimary = goalsByClass[next][0];
    const nextSecondary = goalsByClass[next][1] ?? null;
    setKlass(next);
    setPrimary(nextPrimary);
    setSecondary(nextSecondary);
    setSelection(suggestedSelection(next, nextPrimary, nextSecondary));
    setTalismanId("");
    setWrathBase(false);
    setWrathCriticalBase(0);
    onClassChange(next);
    onTalismanChange("");
  };

  const share = async () => {
    try {
      const url = `${location.origin}${location.pathname}?module=builder&build=${encodeBuild(payload)}#builder`;
      await navigator.clipboard.writeText(url);
      history.replaceState(null, "", url);
      setNotice("Donanım planı bağlantısı kopyalandı.");
    } catch {
      setNotice("Donanım planı bağlantısı kopyalanamadı.");
    }
  };

  const save = () => {
    localStorage.setItem("ikv-build", encodeBuild(payload));
    setNotice("Donanım planı bu cihazda kaydedildi.");
  };

  const load = () => {
    const raw = localStorage.getItem("ikv-build");
    if (!raw) {
      setNotice("Bu cihazda kayıtlı donanım planı yok.");
      return;
    }
    try {
      const snapshot = sanitizeBuild(decodeBuild(raw), buildRules) as BuildSnapshot | null;
      if (!snapshot) throw new Error();
      applySaved(snapshot);
      setNotice("Kayıtlı donanım planı yüklendi.");
    } catch {
      setNotice("Kayıtlı donanım planı geçersiz veya eski sürüm.");
    }
  };

  return (
    <section className="builder" id="builder">
      <Title eyebrow="M2 · DONANIM PLANLAYICI" title="Sekiz yuvayı sen doldur">
        <div className="actions">
          <button onClick={() => setSelection(suggestedSelection(klass, primary, secondary))}>Hedefe göre öner</button>
          <button onClick={share}>Bağlantıyı kopyala</button>
          <button onClick={save}>Kaydet</button>
          <button onClick={load}>Yükle</button>
        </div>
      </Title>
      <div className="builderbox">
        <div className="controls">
          <Field name="01 · Sınıf">
            {classes.map((className) => (
              <button className={klass === className ? "on" : ""} onClick={() => changeClass(className)} key={className}>
                {className}
              </button>
            ))}
          </Field>
          <Field name="02 · Ana hedef">
            {goalsByClass[klass].map((goal) => (
              <button
                className={primary === goal ? "on" : ""}
                onClick={() => {
                  setPrimary(goal);
                  if (secondary === goal) setSecondary(null);
                }}
                key={goal}
              >
                {goal}
              </button>
            ))}
          </Field>
          <Field name="03 · İkincil hedef">
            <select aria-label="İkincil hedef" value={secondary ?? ""} onChange={(event) => setSecondary((event.target.value || null) as Goal | null)}>
              <option value="">Yok</option>
              {goalsByClass[klass].filter((goal) => goal !== primary).map((goal) => <option key={goal}>{goal}</option>)}
            </select>
          </Field>
          <p className="data-note">
            Puanlama yalnız yayımdaki özellik adlarının hedeflerle eşleşmesini ölçer. Tek kaynaklı kayıtlar teyit bekler; sonuç en iyi seçim veya başarı garantisi değildir.
          </p>
          {notice && <p className="notice">{notice}</p>}
        </div>
        <div className="board">
          <div className="summary">
            <div>
              <small>SEÇİLİ DONANIM</small>
              <h3>{klass} · {primary}{secondary ? ` + ${secondary}` : ""}</h3>
              <p>{Object.values(selection).filter(Boolean).length}/{classSlots[klass].length} dolu yuva · hedef puanı {score}</p>
            </div>
            <b>SINIF UYUMLU</b>
          </div>
          <div className={`buildAudit ${missingSlots.length ? "warn" : "ready"}`}>
            <span>{missingSlots.length ? `${missingSlots.length} eksik yuva: ${missingSlots.join(", ")}` : "Donanım planı bütün sınıf yuvalarını dolduruyor."}</span>
            {missingSlots.length > 0 && (
              <button onClick={() => setSelection({ ...suggestedSelection(klass, primary, secondary), ...selection })}>Yalnız eksikleri tamamla</button>
            )}
          </div>
          <div className="slotEditors">
            {classSlots[klass].map((slot) => (
              <label key={slot}>
                <span>{slot}</span>
                <select value={selection[slot] ?? ""} onChange={(event) => setSelection({ ...selection, [slot]: event.target.value || undefined })}>
                  <option value="">Boş bırak</option>
                  {compatibleItems(klass, slot).map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
                </select>
              </label>
            ))}
          </div>
          <Totals totals={totals} />
        </div>
      </div>
    </section>
  );
}

function Totals({ totals }: { totals: Record<string, number> }) {
  return (
    <div className="mechanics">
      <article>
        <small>DONANIM TOPLAMI</small>
        {Object.entries(totals).map(([name, value]) => <p key={name}><b>{name}</b>{fmt(value)}</p>)}
      </article>
      <article>
        <small>HESAP KURALI</small>
        <h4>Çelişkili özellikler hesap dışı</h4>
        <p>Her sınıfın tılsımı yalnız kendi doğrulanmış özelliğine uygulanır; gerekli yetenek tabanı ve tılsım çarpanı ayrı tutulur. Hedef puanı değer büyüklüğü değil, özellik eşleşmesidir.</p>
      </article>
    </div>
  );
}
