"use client";

import Link from "next/link";
import { useState } from "react";
import AtlasCompletionCenter from "./AtlasCompletionCenter";
import {
  projectHealthAuditDate,
  projectHealthMetrics,
  projectHealthPriorities,
  projectHealthScore,
  projectHealthState,
  projectHealthTotals,
} from "../lib/project-health";
import {
  projectCrossModuleVisualGaps,
  projectLiveFacts,
  projectSystemicAuditAreas,
  projectVisualCoverage,
  projectVisualPriorities,
  projectVisualTotals,
} from "../lib/project-coverage";
import { SITE_RELEASE } from "../lib/site-release";

const formatPercent = (value: number) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(value);

export default function ProjectScorecard() {
  const [view, setView] = useState<"health" | "visual" | "completion">("health");
  return (
    <section className="projectHealth" id="health">
      <nav className="healthViewTabs" aria-label="Proje durumu görünümü">
        <button className={view === "health" ? "active" : ""} onClick={() => setView("health")}><span>01</span>Genel durum</button>
        <button className={view === "visual" ? "active" : ""} onClick={() => setView("visual")}><span>02</span>Görsel harita</button>
        <button className={view === "completion" ? "active" : ""} onClick={() => setView("completion")}><span>03</span>Veri açıkları</button>
      </nav>

      {view === "completion" ? <AtlasCompletionCenter /> : view === "visual" ? <VisualCoverage /> : <>
        <div className="healthHero">
          <div>
            <p className="eyebrow">ATLAS DENETİMİ · OTOMATİK HESAP</p>
            <h2>Canlı proje durumu</h2>
            <p>
              Nefer Atlası yalnız içeriği değil, kendi eksiklerini de yayımlar.
              Sayılar katalog, reçete, maden, görsel ve kanıt verisinden otomatik türetilir.
            </p>
          </div>
          <div className={`healthScore ${projectHealthState === "Güçlü" ? "strong" : "progress"}`}>
            <small>GENEL SAĞLIK</small>
            <strong>{projectHealthScore}</strong>
            <span>/ 100 · {projectHealthState}</span>
            <i>Son veri denetimi · {projectHealthAuditDate}</i>
          </div>
        </div>

        <div className="healthFacts" aria-label="Katalog büyüklüğü">
          <div><strong>{projectHealthTotals.items}</strong><span>yayımdaki eşya</span></div>
          <div><strong>{projectHealthTotals.sources}</strong><span>kayıtlı kaynak</span></div>
          <div><strong>{projectHealthTotals.claims}</strong><span>alan bazlı kanıt</span></div>
        </div>

        <section className="liveRelease" aria-labelledby="live-release-title">
          <div className="liveReleaseLead">
            <small>{SITE_RELEASE.milestone} · CANLI SÜRÜM · {SITE_RELEASE.releasedAt}</small>
            <h3 id="live-release-title">v{SITE_RELEASE.version} · {SITE_RELEASE.title}</h3>
            <p>{SITE_RELEASE.summary}</p>
          </div>
          <ul>{SITE_RELEASE.changes.map((change) => <li key={change}>{change}</li>)}</ul>
        </section>

        <div className="liveFacts" aria-label="Çapraz sistem özeti">
          <article><b>{projectLiveFacts.productionRecipes}</b><span>ortak üretim reçetesi</span><small>Eşya · ara malzeme · tılsım · iksir</small></article>
          <article><b>{projectLiveFacts.visualFamiliesCovered}/{projectLiveFacts.visualFamiliesTotal}</b><span>ortak görsel ailesi</span><small>Eşya, tılsım ve iksir birlikte</small></article>
          <article><b>{projectLiveFacts.exactRecipeSources}/{projectLiveFacts.productionRecipes}</b><span>kesin reçete edinim kaynağı</span><small>Kesin eşleşmeler tılsım reçetelerinde</small></article>
          <article className="warn"><b>{projectLiveFacts.recipesWithoutExactSource}</b><span>kesin edinim yeri açık reçete</span><small>{projectLiveFacts.talismanRecipesWithoutExactSource} tılsım · {projectLiveFacts.nonTalismanRecipesWithoutAcquisition} diğer tür</small></article>
        </div>
        {projectLiveFacts.missingSpecialTalismanRecipeCount > 0 && <aside className="liveCaveat">
          <b>{projectLiveFacts.missingSpecialTalismanRecipeCount} özel tılsım formülü açık</b>
          <span>Üretim kuralı reçete gerektiriyor ancak kaynak tablosunda formül yok: {projectLiveFacts.missingSpecialTalismanRecipes.join(" · ")}. Sahte reçete üretilmedi.</span>
        </aside>}
        {projectLiveFacts.progressionGapCount > 0 && <aside className="liveCaveat">
          <b>{projectLiveFacts.progressionGapCount} KÖ ilerleme başlığı açık · {projectLiveFacts.p0ProgressionGapCount} P0</b>
          <span>+ basma, Kozmik Yükseltme ve Gök Tapınağı yüksek etkili sırada. Çelişkili kayıt: {projectLiveFacts.conflictedProgressionGaps.join(" · ") || "yok"}. <Link href="/?module=endgame&panel=Y%C3%BCkseltme#endgame">Yükseltme merkezini aç →</Link></span>
        </aside>}

        <div className="healthMetricGrid">
          {projectHealthMetrics.map((metric) => (
            <article className={`healthMetric ${metric.state === "Güçlü" ? "strong" : metric.state === "Gelişiyor" ? "progress" : "waiting"}`} key={metric.id}>
              <div className="metricTop">
                <span>{metric.shortLabel}</span>
                <b>{formatPercent(metric.percent)}%</b>
              </div>
              <div className="metricBar" aria-hidden="true"><i style={{ width: `${metric.percent}%` }} /></div>
              <h3>{metric.label}</h3>
              <p>{metric.detail}</p>
              <footer>
                <span>{metric.value}/{metric.total}</span>
                <em>{metric.state} · ağırlık %{metric.weight}</em>
              </footer>
            </article>
          ))}
        </div>

        <div className="healthPriorities">
          <div>
            <small>OTOMATİK ÖNCELİK KUYRUĞU</small>
            <h3>Şimdi yoğunlaş</h3>
            <p>En düşük kapsama sahip üç başlık veri değiştikçe kendiliğinden yeniden sıralanır.</p>
          </div>
          <ol>
            {projectHealthPriorities.map((metric) => (
              <li key={metric.id}>
                <b>{metric.label}</b>
                <span>{metric.action}</span>
                <strong>{formatPercent(metric.percent)}%</strong>
              </li>
            ))}
          </ol>
        </div>

        <details className="healthMethod">
          <summary>Puan ve güncel durum nasıl hesaplanıyor?</summary>
          <p>
            Kanıt %25, özellik %20, eşyanın elde edilme yolu %15, görünüş ailesi
            kapsamı %20, bütünlük %15 ve güncellik %5 ağırlık taşır. Reçete
            formülünün bulunması ile reçete kâğıdının NPC, sandık veya drop kaynağı
            ayrı ölçülür. Bütünlük metriği model içindeki sekiz yapısal kontrolü gösterir;
            tam yayın testleri ayrıca zorunlu kapıdır. Her sürümde SITE_RELEASE kaydı ve veri dosyaları değişince
            bu ekran yeni sayıları ve tamamlanan işleri kendiliğinden gösterir.
          </p>
        </details>
      </>}
    </section>
  );
}

function VisualCoverage() {
  return <div className="visualCoverage">
    <header className="visualCoverageHero">
      <div>
        <p>CANLI GÖRSEL ENVANTERİ · VERİDEN OTOMATİK</p>
        <h2>Bir ikon gelince,<br/><em>bağlı her yer güncellenir.</em></h2>
        <span>Tek bir bölümü değil; katalog, reçete, maden, stok ve üretim akışını aynı denetimde ele alıyoruz.</span>
      </div>
      <aside>
        <article><b>{projectVisualTotals.verifiedAssets}</b><span>aktif bağlı görsel varlığı</span></article>
        <article><b>{projectVisualTotals.openAssetTasks}</b><span>benzersiz görsel işi açık</span></article>
        <article><b>{projectVisualTotals.completedAreas}/{projectVisualTotals.areas}</b><span>kapsam başlığı tamam</span></article>
      </aside>
    </header>

    <section className="visualPriority" aria-labelledby="visual-priority-title">
      <header><small>EN YÜKSEK KALDIRAÇ</small><h3 id="visual-priority-title">Önce en çok kaydı kapatan görsel</h3><p>Öncelik, bir eksik varlığın kaç kaydı birlikte tamamlayacağına göre otomatik sıralanır.</p></header>
      <ol>{projectVisualPriorities.slice(0, 4).map((metric) => <li key={metric.id}>
        <span><b>{metric.label}</b><small>{metric.missing.length} varlık bekliyor</small></span>
        <strong>{metric.affectedRecords}<small>etkilenen kayıt</small></strong>
      </li>)}</ol>
    </section>

    <div className="visualCoverageGrid">
      {projectVisualCoverage.map((metric) => <article className={`visualCoverageCard ${metric.state === "Tamamlandı" ? "complete" : metric.state === "Sürüyor" ? "progress" : "waiting"}`} key={metric.id}>
        <header><small>{metric.eyebrow}</small><b>{formatPercent(metric.percent)}%</b></header>
        <div className="visualCoverageBar" aria-hidden="true"><i style={{ width: `${metric.percent}%` }}/></div>
        <h3>{metric.label}</h3>
        <strong>{metric.value}/{metric.total} <small>· {metric.state}</small></strong>
        <p>{metric.detail}</p>
        <span>{metric.recordScope}</span>
        <footer>
          {metric.missing.length ? <details>
            <summary>{metric.missing.length} eksiği aç</summary>
            <ul>{metric.missing.map((name) => <li key={name}>{name}</li>)}</ul>
          </details> : <em>Bu kapsamda açık görsel yok.</em>}
          <Link href={metric.href}>İlgili bölümü aç →</Link>
        </footer>
      </article>)}
    </div>

    <section className="crossAudit">
      <div className="crossAuditCopy">
        <small>KALICI ÇALIŞMA KURALI</small>
        <h3>İstek tek yerde başlasa da denetim bütün sistemde biter.</h3>
        <p>Örneğin bir tılsım ikonu istendiğinde yalnız tılsım kartı değil; reçete girdisi, maden/malzeme bağlantısı, stok, fotoğraf taslağı, arama ve yayın testleri de kontrol edilir.</p>
        {projectCrossModuleVisualGaps.length > 0 && <aside><b>Şu anda birden fazla modülü aynı anda etkileyen görsel açık:</b><span>{projectCrossModuleVisualGaps.join(" · ")}</span></aside>}
      </div>
      <ol>{projectSystemicAuditAreas.map((area, index) => <li key={area.id}><i>{String(index + 1).padStart(2, "0")}</i><span><b>{area.label}</b><small>{area.detail}</small></span></li>)}</ol>
    </section>
  </div>;
}
