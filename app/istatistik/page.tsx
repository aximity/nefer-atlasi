import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAnalyticsAdmin } from "../../lib/analytics-auth.server";
import { getAnalyticsSummary } from "../../lib/analytics-repository.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trafik Merkezi | Nefer Atlası",
  description: "Nefer Atlası sahibine özel trafik ve gelir hazırlık paneli.",
  robots: { index: false, follow: false },
};

function NumberCard({ label, value, note }: { label: string; value: number; note: string }) {
  return <article><small>{label}</small><strong>{value.toLocaleString("tr-TR")}</strong><span>{note}</span></article>;
}

function RankedList({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <section className="analyticsPanel">
      <h2>{title}</h2>
      {rows.length === 0 ? <p className="analyticsEmpty">Veri birikmeye başladığında burada görünecek.</p> : <ol>
        {rows.map((row) => <li key={row.label}>
          <div><b>{row.label}</b><span>{row.value.toLocaleString("tr-TR")}</span></div>
          <i style={{ width: `${Math.max(4, row.value / max * 100)}%` }} />
        </li>)}
      </ol>}
    </section>
  );
}

export default async function AnalyticsDashboard({
  searchParams,
}: {
  searchParams: Promise<{ gun?: string }>;
}) {
  if (!(await isAnalyticsAdmin())) redirect("/istatistik/giris");
  const { gun } = await searchParams;
  const days = [7, 30, 90].includes(Number(gun)) ? Number(gun) : 30;
  const summary = await getAnalyticsSummary(days);
  const maxTimeline = Math.max(1, ...summary.timeline.map((row) => row.views));
  return (
    <main className="analyticsDashboard">
      <header>
        <Link className="analyticsBrand" href="/"><b>N</b><span>NEFER ATLASI</span></Link>
        <div><small>SAHİBE ÖZEL</small><h1>Trafik Merkezi</h1></div>
        <form action="/api/analytics/logout" method="post"><button type="submit">Çıkış</button></form>
      </header>
      <nav aria-label="İstatistik dönemi">
        {[7, 30, 90].map((value) => <a className={days === value ? "active" : ""} href={`/istatistik?gun=${value}`} key={value}>{value} gün</a>)}
      </nav>
      <section className="analyticsMetrics">
        <NumberCard label="BUGÜN" value={summary.todayViews} note={`${summary.todayVisitors} tekil ziyaretçi`} />
        <NumberCard label={`${days} GÜNLÜK GÖRÜNTÜLEME`} value={summary.totalViews} note="Bot trafiği hariç" />
        <NumberCard label={`${days} GÜNLÜK TEKİL`} value={summary.uniqueVisitors} note="Günlük anonim sayım" />
        <NumberCard label="SAYFA / ZİYARETÇİ" value={summary.uniqueVisitors ? Number((summary.totalViews / summary.uniqueVisitors).toFixed(1)) : 0} note="İçerik derinliği göstergesi" />
      </section>
      <section className="analyticsPanel timelinePanel">
        <div className="panelHeading"><h2>Günlük hareket</h2><span>Görüntüleme / tekil</span></div>
        {summary.timeline.length === 0 ? <p className="analyticsEmpty">İlk ziyaretlerden sonra grafik oluşacak.</p> : <div className="timelineBars">
          {summary.timeline.map((row) => <div key={row.day} title={`${row.day}: ${row.views} görüntüleme, ${row.visitors} tekil`}>
            <i style={{ height: `${Math.max(6, row.views / maxTimeline * 100)}%` }} />
            <span>{row.day.slice(5)}</span>
          </div>)}
        </div>}
      </section>
      <div className="analyticsGrid">
        <RankedList title="En çok açılan sayfalar" rows={summary.pages} />
        <RankedList title="Trafik kaynakları" rows={summary.sources} />
        <RankedList title="Cihazlar" rows={summary.devices} />
        <section className="analyticsPanel revenuePanel">
          <h2>Reklam hazırlığı</h2>
          <ul>
            <li><b>Hazır</b><span>Reklam alanları kodda pasif bekliyor.</span></li>
            <li><b>Hazır</b><span>İzin katmanı reklam açıldığında otomatik görünür.</span></li>
            <li><b>Bekliyor</b><span>AdSense yayıncı ve reklam alanı kimlikleri.</span></li>
            <li><b>Bekliyor</b><span>Yeterli düzenli trafik ve içerik olgunluğu.</span></li>
          </ul>
          <p>Reklamlar şu an kapalıdır; ziyaretçiye boş reklam kutusu veya izin penceresi gösterilmez.</p>
        </section>
      </div>
      <footer><span>Ham IP tutulmaz · günlük anonim kimlik 90 gün içinde anlamını kaybeder</span><a href="/gizlilik">Gizlilik açıklaması</a></footer>
    </main>
  );
}
