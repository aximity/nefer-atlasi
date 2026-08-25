import {
  projectHealthAuditDate,
  projectHealthMetrics,
  projectHealthPriorities,
  projectHealthScore,
  projectHealthState,
  projectHealthTotals,
} from "../lib/project-health";

const formatPercent = (value: number) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(value);

export default function ProjectScorecard() {
  return (
    <section className="projectHealth" id="health">
      <div className="healthHero">
        <div>
          <p className="eyebrow">ATLAS DENETİMİ · OTOMATİK HESAP</p>
          <h2>Proje puan kartı</h2>
          <p>
            Nefer Atlası kendi veri sağlığını da yayımlar. Puan popülerlik değil;
            kaynak, özellik, elde etme, medya, bütünlük ve güncellik kapsamıdır.
          </p>
        </div>
        <div className={`healthScore ${projectHealthState === "Güçlü" ? "strong" : "progress"}`}>
          <small>GENEL SAĞLIK</small>
          <strong>{projectHealthScore}</strong>
          <span>/ 100 · {projectHealthState}</span>
          <i>{projectHealthAuditDate}</i>
        </div>
      </div>

      <div className="healthFacts" aria-label="Katalog büyüklüğü">
        <div><strong>{projectHealthTotals.items}</strong><span>yayımdaki eşya</span></div>
        <div><strong>{projectHealthTotals.sources}</strong><span>kayıtlı kaynak</span></div>
        <div><strong>{projectHealthTotals.claims}</strong><span>alan bazlı kanıt</span></div>
      </div>

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
        <summary>Puan nasıl hesaplanıyor?</summary>
        <p>
          Kanıt %25, özellik %20, elde etme %15, doğrulanmış medya %20,
          bütünlük %15 ve güncellik %5 ağırlık taşır. 75–100 “Güçlü”, 45–74
          “Gelişiyor”, 0–44 “Veri bekliyor” olarak gösterilir. Medya puanı yalnız
          eşya adı ve görünüşü aynı kanıtta yer aldığında artar.
        </p>
      </details>
    </section>
  );
}
