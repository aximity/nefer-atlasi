"use client";
import { useMemo, useState } from "react";
import { quests, type Quest } from "../lib/catalog";
import { normalizePlayerLevel, prerequisiteChain, questLocationLabel, questsForLevel } from "../lib/quest-core.mjs";

export default function QuestExplorer() {
  const [levelInput, setLevelInput] = useState("");
  const filtered = useMemo(() => questsForLevel(quests, levelInput), [levelInput]);
  const [selectedId, setSelectedId] = useState(quests[0]?.questId ?? "");
  const selected = filtered.find((quest) => quest.questId === selectedId) ?? filtered[0] ?? null;
  const parsedLevel = normalizePlayerLevel(levelInput);
  const invalid = levelInput.trim() !== "" && parsedLevel === null;

  return (
    <section className="questExplorer" id="quests" aria-labelledby="quest-title">
      <div className="questHeading">
        <div>
          <p className="eyebrow">M5 · KAYNAKLI GÖREV İZİ</p>
          <h2 id="quest-title">Seviyene açılan görevler</h2>
          <p>Doğrulanmış erken görevleri seviyene göre süz, ayrıntıyı ve bilinen önceki adımları izle.</p>
        </div>
        <label className="levelControl">
          <span>Oyuncu seviyesi</span>
          <div>
            <input
              aria-label="Oyuncu seviyesi"
              inputMode="numeric"
              value={levelInput}
              onChange={(event) => setLevelInput(event.target.value)}
              placeholder="1–59"
            />
            <button type="button" onClick={() => setLevelInput("")} disabled={!levelInput}>Temizle</button>
          </div>
          <small>{invalid ? "1 ile 59 arasında tam sayı gir." : parsedLevel ? `${parsedLevel}. seviyeye kadar ${filtered.length} görev` : `${quests.length} doğrulanmış görev gösteriliyor`}</small>
        </label>
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
              <span>SEVİYE {quest.minLevel}</span>
              <strong>{quest.name}</strong>
              <small>{quest.giverNpc ?? "Otomatik görev"}</small>
            </button>
          ))}
        </div>
        {selected && <QuestDetail quest={selected} />}
      </div>
    </section>
  );
}

function QuestDetail({quest}:{quest:Quest}) {
  const chain = prerequisiteChain(quest.questId, quests);
  return (
    <article className="questDetail" aria-live="polite">
      <header>
        <div><small>GÖREV DETAYI</small><h3>{quest.name}</h3></div>
        <b>Seviye {quest.minLevel}</b>
      </header>
      <dl>
        <div><dt>Görevi veren</dt><dd>{quest.giverNpc ?? "Otomatik görev"}</dd></div>
        <div><dt>Konum</dt><dd>{questLocationLabel(quest)}</dd></div>
        <div><dt>Yapılacak</dt><dd>{quest.objective ?? "Görev açıklaması doğrulanıyor"}</dd></div>
      </dl>
      <section className="questTrail" aria-label="Önceki görevler">
        <small>ÖNCEKİ GÖREVLER</small>
        {chain.length ? (
          <ol>{chain.map((step) => <li key={step.questId}><span>Seviye {step.minLevel}</span><b>{step.name}</b></li>)}</ol>
        ) : <p>Bu kayıt için doğrulanmış bir önceki görev bulunmuyor.</p>}
      </section>
    </article>
  );
}
