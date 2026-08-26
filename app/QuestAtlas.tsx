"use client";

import { useEffect, useMemo, useState } from "react";
import {
  questById,
  quests,
  questSources,
  questTracks,
  rewardFor,
  unlockedBy,
  type Quest,
  type QuestClass,
} from "../lib/quest-catalog";
import { parseQuestLevel, questLevelWindow, questMatchesLevel } from "../lib/quest-level";

const classes: QuestClass[] = ["Savaşçı", "Büyücü", "Şifacı"];
const STORAGE_KEY = "nefer-atlasi:quest-progress:v1";
type View = "route" | "chains" | "rewards" | "all";

const views: { id: View; label: string }[] = [
  { id: "route", label: "Yeni hesap rotası" },
  { id: "chains", label: "Zincirler" },
  { id: "rewards", label: "Eşya ödüllü" },
  { id: "all", label: "Tümü" },
];

function normalized(value: string) {
  return value.toLocaleLowerCase("tr-TR").normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

function ancestorsOf(quest: Quest) {
  const seen = new Set<string>();
  const result: Quest[] = [];
  const visit = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    const item = questById.get(id);
    if (!item) return;
    item.dependsOn.forEach(visit);
    result.push(item);
  };
  quest.dependsOn.forEach(visit);
  return result;
}

export default function QuestAtlas() {
  const [klass, setKlass] = useState<QuestClass>("Savaşçı");
  const [view, setView] = useState<View>("route");
  const [track, setTrack] = useState("Tümü");
  const [levelInput, setLevelInput] = useState("15");
  const [query, setQuery] = useState("");
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Quest | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let savedIds: string[] = [];
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (Array.isArray(saved)) savedIds = saved.filter((id) => typeof id === "string" && questById.has(id));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    const hydration = window.setTimeout(() => {
      setCompleted(new Set(savedIds));
      setReady(true);
    }, 0);
    return () => window.clearTimeout(hydration);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
  }, [completed, ready]);

  useEffect(() => {
    if (!selected) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [selected]);

  const level = parseQuestLevel(levelInput);
  const levelRange = level ? questLevelWindow(level) : null;

  const filtered = useMemo(() => {
    const needle = normalized(query.trim());
    if (!level) return [];
    return quests
      .filter((quest) => questMatchesLevel(quest.level, level))
      .filter((quest) => track === "Tümü" || quest.track === track)
      .filter((quest) => {
        if (view === "route") return quest.recommended;
        if (view === "chains") return quest.dependsOn.length > 0 || unlockedBy(quest.id).length > 0;
        if (view === "rewards") return Boolean(rewardFor(quest, klass));
        return true;
      })
      .filter((quest) => {
        if (!needle) return true;
        const rewards = Object.values(quest.reward ?? {}).join(" ");
        return normalized([
          quest.title,
          quest.giver,
          quest.location,
          quest.region,
          quest.objective,
          quest.track,
          rewards,
        ].join(" ")).includes(needle);
      })
      .sort((a, b) => a.level - b.level || a.track.localeCompare(b.track, "tr") || a.title.localeCompare(b.title, "tr"));
  }, [klass, level, query, track, view]);

  const eligible = level
    ? quests.filter((quest) => quest.recommended && questMatchesLevel(quest.level, level))
    : [];
  const finished = eligible.filter((quest) => completed.has(quest.id)).length;
  const next = eligible.find(
    (quest) => !completed.has(quest.id) && quest.dependsOn.every((id) => completed.has(id)),
  ) ?? eligible.find((quest) => !completed.has(quest.id));
  const progress = eligible.length ? Math.round((finished / eligible.length) * 100) : 0;

  const toggle = (quest: Quest) => {
    setCompleted((current) => {
      const updated = new Set(current);
      if (updated.has(quest.id)) updated.delete(quest.id);
      else updated.add(quest.id);
      return updated;
    });
  };

  const openQuest = (quest: Quest) => {
    setSelected(quest);
    requestAnimationFrame(() => document.querySelector(".questSheet")?.scrollTo(0, 0));
  };

  return (
    <section className="questAtlas" id="quests">
      <header className="questHero">
        <div>
          <p className="questEyebrow">KÖ OYUNCU ROTA SİSTEMİ</p>
          <h2>Görev Atlası</h2>
          <p>
            Görevi kimden alacağını, nerede ve nasıl yapacağını, hangi görevin devamı
            olduğunu ve sınıfına göre verdiği eşyayı tek yerden takip et.
          </p>
        </div>
        <aside className="questProgress" aria-label="Görev ilerlemesi">
          <span>{levelRange ? `SEVİYE ${levelRange.min}–${levelRange.max} GÖREVLERİ` : "GEÇERLİ SEVİYE GİR"}</span>
          <strong>%{progress}</strong>
          <div><i style={{ width: `${progress}%` }} /></div>
          <small>{finished} / {eligible.length} seviyene uygun adım tamamlandı</small>
        </aside>
      </header>

      <div className="questNext">
        <span>ŞİMDİ NE YAPMALI?</span>
        {next ? (
          <button onClick={() => openQuest(next)}>
            <b>{next.title}</b>
            <small>Sv. {next.level} · {next.giver} · {next.location}</small>
          </button>
        ) : (
          <p>{level ? "Bu seviye aralığındaki önerilen rota tamamlandı veya henüz katalogda görev yok." : "Önce 1–49 arasında karakter seviyeni gir."}</p>
        )}
      </div>

      <div className="questControls">
        <label className="questSearch">
          <span>Görev, NPC, yer veya ödül eşyası ara</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Örn. Anka, Agah Efendi, Labirent…" />
        </label>
        <label>
          <span>Mevcut seviye</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            value={levelInput}
            aria-invalid={levelInput !== "" && level === null}
            placeholder="1–49"
            onChange={(event) => setLevelInput(event.target.value.replace(/\D/g, "").slice(0, 2))}
          />
          <small>{levelRange ? `Sv. ${levelRange.min}–${levelRange.max} gösterilir` : "Alanı silip yeni seviyeyi yazabilirsin"}</small>
        </label>
        <label>
          <span>Görev hattı</span>
          <select value={track} onChange={(event) => setTrack(event.target.value)}>
            <option>Tümü</option>
            {questTracks.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <div className="questClassTabs" aria-label="Karakter sınıfı">
        {classes.map((item) => (
          <button key={item} className={klass === item ? "active" : ""} onClick={() => setKlass(item)}>{item}</button>
        ))}
      </div>
      <div className="questViewTabs" aria-label="Görev görünümü">
        {views.map((item) => (
          <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}>{item.label}</button>
        ))}
      </div>

      <div className="questResultHead">
        <p><b>{filtered.length}</b> {levelRange ? `görev · Sv. ${levelRange.min}–${levelRange.max}` : "görev"} gösteriliyor</p>
        <span>Özgün oyun Wiki’si · KÖ teyidi bekliyor</span>
      </div>

      <div className="questGrid">
        {filtered.map((quest) => {
          const done = completed.has(quest.id);
          const missing = quest.dependsOn.filter((id) => !completed.has(id));
          const reward = rewardFor(quest, klass);
          const following = unlockedBy(quest.id);
          return (
            <article className={`questCard${done ? " done" : ""}${missing.length ? " locked" : ""}`} key={quest.id}>
              <header>
                <span className="questLevel">{String(quest.level).padStart(2, "0")}</span>
                <div>
                  <small>{quest.track} · {quest.region}</small>
                  <h3>{quest.title}</h3>
                </div>
                <button className="questCheck" onClick={() => toggle(quest)} aria-label={`${quest.title} görevini ${done ? "tamamlanmadı" : "tamamlandı"} işaretle`}>
                  {done ? "✓" : "○"}
                </button>
              </header>
              <dl>
                <div><dt>Kiminle?</dt><dd>{quest.giver}</dd></div>
                <div><dt>Nerede?</dt><dd>{quest.location}</dd></div>
              </dl>
              <p className="questObjective">{quest.objective}</p>
              {reward && <p className="questReward"><span>{klass} ödülü</span><b>{reward}</b></p>}
              {missing.length > 0 && (
                <p className="questLock">Önce: {missing.map((id) => questById.get(id)?.title ?? id).join(" · ")}</p>
              )}
              <footer>
                <span>{following.length ? `${following.length} görevin kilidini açar` : "Zincir sonu / bağımsız"}</span>
                <button onClick={() => openQuest(quest)}>Detay ve bağlantılar →</button>
              </footer>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && <p className="questEmpty">{level ? `Sv. ${levelRange?.min}–${levelRange?.max} aralığında bu filtrelerle eşleşen kaynaklı görev bulunamadı.` : "Görevleri görmek için 1–49 arasında geçerli bir seviye gir."}</p>}

      <footer className="questSourceNote">
        <div>
          <b>Kaynak ve doğrulama durumu</b>
          <p>
            Bu ilk sürüm, yeni hesap rotası ve önemli bölge erişim zincirlerinden oluşan
            kaynaklı bir çekirdektir. Özgün oyun verileri KÖ içinde ayrıca doğrulanmalıdır.
          </p>
        </div>
        <nav>
          <a href={questSources.chain} target="_blank" rel="noreferrer">Zincir görev kaynağı</a>
          <a href={questSources.explained} target="_blank" rel="noreferrer">Açıklamalı görevler</a>
          <a href={questSources.warriorRewards} target="_blank" rel="noreferrer">Savaşçı ödülleri</a>
          <a href={questSources.mageRewards} target="_blank" rel="noreferrer">Büyücü ödülleri</a>
          <a href={questSources.healerRewards} target="_blank" rel="noreferrer">Şifacı ödülleri</a>
        </nav>
      </footer>

      {selected && (
        <div className="questOverlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
          <article className="questSheet" role="dialog" aria-modal="true" aria-labelledby="quest-dialog-title">
            <header>
              <div>
                <small>SV. {selected.level} · {selected.track} · {selected.region}</small>
                <h3 id="quest-dialog-title">{selected.title}</h3>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Görev detayını kapat">×</button>
            </header>
            <section className="questSheetRoute">
              <div><span>GÖREVİ VEREN</span><b>{selected.giver}</b></div>
              <div><span>KONUM</span><b>{selected.location}</b></div>
              {selected.timed && <div><span>SÜRE</span><b>{selected.timed}</b></div>}
            </section>
            <section>
              <h4>Nasıl yapılır?</h4>
              <p>{selected.objective}</p>
              {selected.note && <p className="questSheetNote">{selected.note}</p>}
            </section>
            <section>
              <h4>{klass} ödülü</h4>
              <p className="questSheetReward">{rewardFor(selected, klass) ?? "Bu sınıf için kaynakta kayıtlı eşya ödülü yok."}</p>
            </section>
            <section>
              <h4>Önceki görevler</h4>
              <div className="questLinks">
                {ancestorsOf(selected).length ? ancestorsOf(selected).map((quest) => (
                  <button key={quest.id} onClick={() => openQuest(quest)} className={completed.has(quest.id) ? "done" : ""}>
                    <span>Sv. {quest.level}</span>{quest.title}{completed.has(quest.id) && " ✓"}
                  </button>
                )) : <p>Ön koşul görünmüyor; bu görev bağımsız bir başlangıç olabilir.</p>}
              </div>
            </section>
            <section>
              <h4>Bu görevden sonra</h4>
              <div className="questLinks">
                {unlockedBy(selected.id).length ? unlockedBy(selected.id).map((quest) => (
                  <button key={quest.id} onClick={() => openQuest(quest)}><span>Sv. {quest.level}</span>{quest.title}</button>
                )) : <p>Kaynaklı çekirdekte bu görevden sonra bağlı adım bulunmuyor.</p>}
              </div>
            </section>
            <footer>
              <button className="questDoneButton" onClick={() => toggle(selected)}>
                {completed.has(selected.id) ? "Tamamlandı işaretini kaldır" : "Görevi tamamlandı işaretle"}
              </button>
              <span>İlerleme yalnızca bu cihazda saklanır.</span>
            </footer>
          </article>
        </div>
      )}
    </section>
  );
}
