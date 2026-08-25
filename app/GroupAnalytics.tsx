"use client";

import { useEffect, useState } from "react";

type Bucket = { label: string; count: number };
type Stats = { total30: number; total7: number; evidence: { level: number; label: string; nextAt: number | null }; roles: { visible: Bucket[]; suppressed: number }; regions: { visible: Bucket[]; suppressed: number }; categories: { visible: Bucket[]; suppressed: number }; hours: { visible: Bucket[]; suppressed: number } };

function Distribution({ title, subtitle, rows, suppressed }: { title: string; subtitle: string; rows: Bucket[]; suppressed: number }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  return <section className="demand-distribution"><header><span><small>{subtitle}</small><h4>{title}</h4></span>{suppressed > 0 && <b>{suppressed} düşük örnekli başlık gizlendi</b>}</header>
    {rows.length === 0 ? <p className="distribution-empty">Bir başlığı göstermek için en az 3 ilan gerekli.</p> : <div>{rows.map((row) => <article key={row.label}><span>{row.label}</span><div><i style={{ width: `${Math.max(8, row.count / max * 100)}%` }}/></div><b>{row.count}</b></article>)}</div>}
  </section>;
}

export default function GroupAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/group-board/stats?t=${Date.now()}`, { cache: "no-store", signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then((data) => { setStats(data); setState("ready"); })
      .catch((error) => { if (error?.name !== "AbortError") setState("error"); });
    return () => controller.abort();
  }, []);

  return <div className="eg-panel group-analytics">
    <div className="panel-intro"><div><small>M16 · GRUP İHTİYACI ANALİZİ</small><h3>Hangi rol, nerede ve ne zaman eksik?</h3></div><p>Son 30 gündeki yapılandırılmış ilanlardan topluluk ihtiyacını çıkarır. Oyuncu adı, telefon, sohbet metni ve özel bağlantı analiz verisine girmez.</p></div>
    {state === "loading" ? <div className="analytics-empty"><i>◇</i><b>İhtiyaç verisi hazırlanıyor</b></div> : state === "error" || !stats ? <div className="analytics-empty"><i>◇</i><b>Analiz şu an okunamadı</b><span>İlan panosu çalışmaya devam eder; analiz verisi daha sonra yenilenebilir.</span></div> : <>
      <div className={`analytics-overview level-${stats.evidence.level}`}><article><small>SON 7 GÜN</small><strong>{stats.total7}</strong><span>yapılandırılmış ilan</span></article><article><small>SON 30 GÜN</small><strong>{stats.total30}</strong><span>iptal edilenler hariç</span></article><article><small>KANIT DÜZEYİ</small><strong>{stats.evidence.label}</strong><span>{stats.evidence.nextAt ? `Sonraki seviye için ${Math.max(0, stats.evidence.nextAt - stats.total30)} ilan daha` : "Düzenli veri toplamaya devam et"}</span></article></div>
      {stats.total30 < 3 && <div className="analytics-caution"><b>Henüz meta çıkarma.</b><p>Üç ilandan az veri, hangi rolün veya bölgenin gerçekten darboğaz olduğunu söylemez. Grafikler bu yüzden kapalı tutuluyor.</p></div>}
      <div className="demand-grid"><Distribution title="Aranan roller" subtitle="ROL DARBOĞAZI" rows={stats.roles.visible} suppressed={stats.roles.suppressed}/><Distribution title="Yoğun bölgeler" subtitle="BÖLGE TALEBİ" rows={stats.regions.visible} suppressed={stats.regions.suppressed}/><Distribution title="Etkinlik türleri" subtitle="AMAÇ DAĞILIMI" rows={stats.categories.visible} suppressed={stats.categories.suppressed}/><Distribution title="Başlangıç saatleri" subtitle="UTC+3 · 2 SAATLİK DİLİM" rows={stats.hours.visible} suppressed={stats.hours.suppressed}/></div>
      <div className="analytics-reading"><span>NASIL OKUNMALI?</span><div><p><b>Çok aranan rol</b> güçlü olduğu anlamına gelmez; bulunmasının zor olduğunu gösterebilir.</p><p><b>Yoğun bölge</b> en kârlı bölge değildir; yalnız daha fazla ilan açılmıştır.</p><p><b>Düşük örnekli başlıklar</b> oyuncu hareketini ele vermemek için tek tek gösterilmez.</p></div></div>
    </>}
  </div>;
}
