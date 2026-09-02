"use client";
import "./quest-explorer.css";
import { useMemo, useState } from "react";
import { quests, type Quest } from "../lib/catalog";
import { normalizePlayerLevel, partitionQuests, prerequisiteChain, questAvailability, questLocationLabel } from "../lib/quest-core.mjs";

type View = "available" | "prerequisite_locked" | "level_locked" | "all";

export default function QuestExplorer() {
  const [levelInput, setLevelInput] = useState("");
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [view, setView] = useState<View>("available");
  const groups = useMemo(() => partitionQuests(quests, levelInput, completedIds), [levelInput, completedIds]);
  const parsedLevel = normalizePlayerLevel(levelInput);
  const filtered = parsedLevel === null || view === "all" ? quests : groups[view];
  const [selectedId, setSelectedId] = useState(quests[0]?.questId ?? "");
  const selected = filtered.find((quest) => quest.questId === selectedId) ?? filtered[0] ?? null;
  const invalid = levelInput.trim() !== "" && parsedLevel === null;
  const toggleCompleted = (questId:string) => setCompletedIds((current) => { const next=new Set(current); if(next.has(questId))next.delete(questId);else next.add(questId); return next; });

  return (
    <section className="questExplorer" id="quests" aria-labelledby="quest-title">
      <div className="questHeading">
        <div>
          <p className="eyebrow">M5 · KAYNAKLI GÖREV İZİ</p>
          <h2 id="quest-title">Seviyene açılan görevler</h2>
          <p>1–49 kataloğunu seviyene ve tamamladığın önceki görevlere göre süz; ayrıntıyı ve kanıtlı zinciri izle.</p>
        </div>
        <label className="levelControl">
          <span>Oyuncu seviyesi</span>
          <div>
            <input
              aria-label="Oyuncu seviyesi"
              inputMode="numeric"
              value={levelInput}
              onChange={(event) => setLevelInput(event.target.value)}
              placeholder="1–49"
            />
            <button type="button" onClick={() => setLevelInput("")} disabled={!levelInput}>Temizle</button>
          </div>
          <small>{invalid ? "1 ile 49 arasında tam sayı gir." : parsedLevel ? `${groups.available.length} erişilebilir · ${groups.prerequisite_locked.length} önceki görev bekliyor · ${groups.level_locked.length} henüz açılmadı` : `${quests.length} kaynaklı görev gösteriliyor`}</small>
        </label>
      </div>
      <div className="questViews" aria-label="Görev erişim durumu">
        {parsedLevel && <>
          <button type="button" aria-pressed={view === "available"} onClick={() => setView("available")}>Erişilebilir ({groups.available.length})</button>
          <button type="button" aria-pressed={view === "prerequisite_locked"} onClick={() => setView("prerequisite_locked")}>Önceki görev gerekli ({groups.prerequisite_locked.length})</button>
          <button type="button" aria-pressed={view === "level_locked"} onClick={() => setView("level_locked")}>Henüz açılmadı ({groups.level_locked.length})</button>
          <button type="button" aria-pressed={view === "all"} onClick={() => setView("all")}>Tümü ({quests.length})</button>
        </>}
      </div>
      <div className="questWorkspace">
        <div className="questList" aria-label="Uygun görevler">
          {filtered.map((quest) => (
            <button
              type="button"
              className={selected?.questId === quest.questId ? "selected" : ""}
              onClick={() => setSelectedId(quest.questId)}
              key={quest.questId}
            >
              <span>AÇILMA {quest.minLevel}{quest.level !== null ? ` · GÖREV SEVİYESİ ${quest.level}` : ""}</span>
              <strong>{quest.name}</strong>
              <small>{quest.giverNpc ?? "Otomatik görev"}{parsedLevel ? ` · ${availabilityLabel(questAvailability(quest, parsedLevel, completedIds))}` : ""}</small>
            </button>
          ))}
          {!filtered.length && <p className="questEmpty">Bu durumda görev bulunmuyor.</p>}
        </div>
        {selected && <QuestDetail quest={selected} completedIds={completedIds} toggleCompleted={toggleCompleted} />}
      </div>
    </section>
  );
}

const availabilityLabel = (status:string) => ({available:"Erişilebilir", prerequisite_locked:"Önceki görev gerekli", level_locked:"Henüz açılmadı", level_unknown:"Seviye girilmedi"}[status] ?? "");

function QuestDetail({quest,completedIds,toggleCompleted}:{quest:Quest;completedIds:Set<string>;toggleCompleted:(questId:string)=>void}) {
  const chain = prerequisiteChain(quest.questId, quests);
  return (
    <article className="questDetail" aria-live="polite">
      <header>
        <div><small>GÖREV DETAYI</small><h3>{quest.name}</h3></div>
        <b>Seviye {quest.minLevel}</b>
      </header>
      <dl>
        <div><dt>Açılma seviyesi</dt><dd>{quest.minLevel}</dd></div>
        <div><dt>Görev seviyesi</dt><dd>{quest.level ?? "Görev seviyesi doğrulanıyor"}</dd></div>
        <div><dt>Görevi veren</dt><dd>{quest.giverNpc ?? "Otomatik görev"}</dd></div>
        <div><dt>Konum</dt><dd>{questLocationLabel(quest)}</dd></div>
        <div><dt>Yapılacak</dt><dd>{quest.objective ?? "Görev açıklaması doğrulanıyor"}</dd></div>
        <div><dt>Ödül</dt><dd>{quest.reward ?? "Ödül bilgisi doğrulanıyor"}</dd></div>
      </dl>
      <section className="questTrail" aria-label="Önceki görevler">
        <small>ÖNCEKİ GÖREVLER</small>
        {chain.length ? (
          <ol>{chain.map((step) => <li key={step.questId}><span>Seviye {step.minLevel}</span><b>{step.name}</b><button type="button" aria-pressed={completedIds.has(step.questId)} onClick={() => toggleCompleted(step.questId)}>{completedIds.has(step.questId) ? "Tamamlandı" : "Tamamlandı olarak işaretle"}</button></li>)}</ol>
        ) : <p>Bu kayıt için doğrulanmış bir önceki görev bulunmuyor.</p>}
      </section>
    </article>
  );
}
