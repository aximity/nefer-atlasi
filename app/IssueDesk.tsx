"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import issueRows from "../data/issues.json";
import { sourceFor } from "../lib/catalog";

type Priority = "P0" | "P1" | "P2";
type Issue = {
  id: string;
  title: string;
  shortTitle: string;
  priority: Priority;
  category: string;
  area: string;
  evidenceStatus: string;
  observation: string;
  impact: string;
  reproduction: string[];
  inference: string;
  quickFix: string;
  midTermFix: string;
  longTermFix: string;
  metric: string;
  sourceIds: string[];
};

const issues = issueRows as Issue[];
const filters = ["Tümü", "P0", "P1", "P2", "Teknik", "Topluluk", "Ekonomi", "Kaynak", "Denge"] as const;
const priorityLabels: Record<Priority, string> = {
  P0: "Önce durdur",
  P1: "Sıradaki düzeltme",
  P2: "Ölç ve dengele",
};

export default function IssueDesk() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Tümü");
  const visible = useMemo(
    () => issues.filter((issue) => filter === "Tümü" || issue.priority === filter || issue.category === filter),
    [filter],
  );

  return (
    <section className="issueDesk" id="issues">
      <div className="issueIntro">
        <div>
          <p>M29 · OYUNCU GÖZLEMİ + ÇÖZÜM KAYDI</p>
          <h2>Şikâyeti veriye,<br/><em>emeği değere bağla.</em></h2>
          <span>
            Buradaki sorunlar oyuncu bildirimi, teknik açıklamalar ise inceleme hipotezidir.
            Ekonomi gözlemleri paylaşılan sohbetten ad ve telefon numarası çıkarılarak özetlendi.
            Sunucu günlüğü ve ölçüm olmadan hiçbiri kesin kök neden olarak sunulmaz.
          </span>
        </div>
        <aside aria-label="Sorun özeti">
          <article><small>TOPLAM KAYIT</small><b>{issues.length}</b><span>oyuncu bildirimi</span></article>
          <article className="p0"><small>P0</small><b>{issues.filter((issue) => issue.priority === "P0").length}</b><span>oyunu kesen risk</span></article>
          <article className="p1"><small>P1</small><b>{issues.filter((issue) => issue.priority === "P1").length}</b><span>sık akış bozukluğu</span></article>
          <article className="p2"><small>P2</small><b>{issues.filter((issue) => issue.priority === "P2").length}</b><span>denge ve topluluk</span></article>
        </aside>
      </div>

      <div className="issueLegend" aria-label="Kesinlik sözlüğü">
        <article><i>01</i><span><b>Oyuncu bildirimi</b><small>Yaşanan belirti; henüz sistem kaydıyla doğrulanmış kök neden değil.</small></span></article>
        <article><i>02</i><span><b>Teknik çıkarım</b><small>Neyi ölçmek gerektiğini gösteren olası açıklama; kesin hüküm değil.</small></span></article>
        <article><i>03</i><span><b>Çözüm önerisi</b><small>KÖ’ye uyarlanıp küçük pilotla ölçülmesi gereken ürün veya mühendislik adımı.</small></span></article>
      </div>

      <div className="issueToolbar">
        <div role="tablist" aria-label="Sorun filtresi">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={filter === item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <span>{visible.length} kayıt gösteriliyor</span>
      </div>

      <div className="issueGrid">
        {visible.map((issue) => {
          const sources = issue.sourceIds.map(sourceFor).filter(Boolean);
          return (
            <details className={`issueCard priority-${issue.priority.toLowerCase()}`} key={issue.id}>
              <summary>
                <span className="issuePriority"><b>{issue.priority}</b><small>{priorityLabels[issue.priority]}</small></span>
                <span className="issueTitle"><small>{issue.category} · {issue.area}</small><strong>{issue.shortTitle}</strong><em>{issue.observation}</em></span>
                <span className="issueOpen" aria-hidden="true">+</span>
              </summary>
              <div className="issueBody">
                <section className="issueFact">
                  <small>OYUNCU BİLDİRİMİ</small>
                  <h3>{issue.title}</h3>
                  <p>{issue.observation}</p>
                  <div><b>Oyuncuya etkisi</b><span>{issue.impact}</span></div>
                  <i>{issue.evidenceStatus} · telemetri ve tekrar kaydı bekliyor</i>
                </section>

                <section className="issueRepro">
                  <small>TEKRAR ÜRETME PLANI</small>
                  <ol>{issue.reproduction.map((step) => <li key={step}>{step}</li>)}</ol>
                  <div><b>Teknik çıkarım</b><p>{issue.inference}</p></div>
                </section>

                <section className="issueSolutions">
                  <small>KÖ’YE UYUMLU ÇÖZÜM MERDİVENİ</small>
                  <div>
                    <article><i>K0</i><span><b>Hızlı düzeltme</b><p>{issue.quickFix}</p></span></article>
                    <article><i>K1</i><span><b>Orta vade</b><p>{issue.midTermFix}</p></span></article>
                    <article><i>K2</i><span><b>Uzun vade</b><p>{issue.longTermFix}</p></span></article>
                  </div>
                </section>

                <footer className="issueMeasure">
                  <div><small>BAŞARI ÖLÇÜSÜ</small><b>{issue.metric}</b></div>
                  <div className="issueSources">
                    <small>ÇÖZÜM DAYANAĞI</small>
                    {sources.length ? sources.map((source) => source && (
                      <a href={source.url} target="_blank" rel="noreferrer" key={source.id}>{source.title} ↗</a>
                    )) : <span>Dış örnek yok; önce KÖ tur verisiyle pilot ölçümü gerekir.</span>}
                  </div>
                  {issue.id === "group-finding" && <Link className="issueCta" href="/?module=endgame#modules">Mevcut grup panosunu aç →</Link>}
                  {issue.id === "low-tier-material-demand" && <Link className="issueCta" href="/?module=economy#modules">Ekonomi döngülerini aç →</Link>}
                </footer>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
