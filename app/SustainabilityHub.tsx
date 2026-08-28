import Link from "next/link";
import loopRows from "../data/economy-loops.json";
import { sourceFor } from "../lib/catalog";

type EconomyLoop = (typeof loopRows)[number];

const adaptations = [
  {
    sourceId: "albion-lower-tier-sink",
    sourceLesson: "Alt seviye eşyanın sistem tarafından talep edilmesi",
    ikvUse: "Hurdacı Fişi ve haftalık değişen teslim sepeti",
    boundary: "Savaş gücü veya doğrudan para ödülü yok",
  },
  {
    sourceId: "eve-economic-report-2026",
    sourceLesson: "Para giriş–çıkışı ve fiyat eğilimini düzenli ölçmek",
    ikvUse: "Aylık maden tüketimi, NPC bedeli ve pazar süresi raporu",
    boundary: "Gerçek telemetri gelene kadar sonuç değil, ölçüm şablonu",
  },
  {
    sourceId: "fandom-professions-20260826",
    sourceLesson: "Toplayıcı ve üretici mesleklerin mevcut ilişkisi",
    ikvUse: "Maden, taş ve bitkiyi reçete hedefleriyle eşleştirmek",
    boundary: "Wiki verisi tek kaynak olarak etiketlenir; teyit ayrı tutulur",
  },
  {
    sourceId: "fandom-potion-recipes-20260826",
    sourceLesson: "Mevcut malzemelerle tüketilebilir üretim kalıbı",
    ikvUse: "Güç tavanını aşmayan, ortak beklemeli yardımcı iksir pilotu",
    boundary: "PvP/PvE dengesi ölçülmeden kapsam genişletilmez",
  },
] as const;

const eventIdeas = [
  { cadence: "Haftalık", title: "Dönen maden sepeti", purpose: "Her hafta üç farklı malzeme ailesine talep aç; tek maden tekeline izin verme.", measure: "Teslim adedi · benzersiz katkıcı" },
  { cadence: "İki haftalık", title: "Usta–çırak üretim gecesi", purpose: "Eksik reçeteleri sorumlu kişi ve rota listesiyle toplulukça tamamla.", measure: "Tamamlanan favori · yeni üretici" },
  { cadence: "Aylık", title: "Ekonomi sağlık raporu", purpose: "Oyuna giren/çıkan para ile tüketilen madenleri ayrı ayrı yayımla.", measure: "NPC para çıkışı · medyan satış süresi" },
] as const;

export default function SustainabilityHub() {
  const pilotLoops = (loopRows as EconomyLoop[]).filter((loop) => loop.priority === "İlk pilot");
  const citedSources = new Set(loopRows.flatMap((loop) => loop.sourceIds)).size;
  return <section className="sustainabilityHub" id="sustainability">
    <div className="sustainabilityHero">
      <div><p>M34 · SÜRDÜRÜLEBİLİR İKV</p><h2>Toplanan değer kazansın.<br/><em>Ekonomi dönmeye devam etsin.</em></h2><span>Bu bölüm mevcut oyun özelliklerini, tasarım önerilerini ve dış kaynaklardan İKV’ye uyarlanan fikirleri birbirine karıştırmadan gösterir.</span><nav><Link href="/?module=economy#economy">Ekonomi atölyesi</Link><Link href="/?module=endgame&panel=Takvim&community=Planlayıcı#endgame">Etkinlik takvimi</Link><Link href="/?module=mining#mining">Maden rehberi</Link><Link href="/uretim#production-planner">Üretim takibi</Link></nav></div>
      <aside><article><small>ÖNERİ HAVUZU</small><b>{loopRows.length}</b><span>ölçülebilir ekonomi döngüsü</span></article><article><small>İLK PİLOT</small><b>{pilotLoops.length}</b><span>düşük riskli başlangıç</span></article><article><small>KAYNAK AİLESİ</small><b>{citedSources}</b><span>açık atıf zinciri</span></article></aside>
    </div>

    <div className="sustainabilityPillars">
      <article><i>01</i><span><small>MADEN KULLANIMI</small><b>Topla → üret → tüket</b><p>Erken madenler kozmetik, ara malzeme ve dönüşümlü sözleşmelerde gerçekten harcanır.</p></span></article>
      <article><i>02</i><span><small>OYUN PARASI</small><b>NPC hizmetiyle sistemden çıkar</b><p>Üretim, uygulama ve teslim bedeli para çıkışı yaratır; TL ile oyun parası birbirine çevrilmez.</p></span></article>
      <article><i>03</i><span><small>ETKİNLİK DÖNGÜSÜ</small><b>Talebi zamana yay</b><p>Haftalık sepet, üretim gecesi ve aylık rapor farklı oyuncu rollerine düzenli amaç verir.</p></span></article>
    </div>

    <section className="sustainabilitySection">
      <header><div><p>ETKİNLİK TAKVİMİ ÖNERİLERİ</p><h3>Tek seferlik ödül değil, tekrar eden amaç.</h3></div><Link href="/?module=endgame&panel=Takvim&community=Planlayıcı#endgame">Takvim çalışma alanını aç →</Link></header>
      <div className="eventIdeaGrid">{eventIdeas.map((idea) => <article key={idea.title}><small>{idea.cadence} · TASARIM ÖNERİSİ</small><h4>{idea.title}</h4><p>{idea.purpose}</p><span><b>Ölç:</b> {idea.measure}</span></article>)}</div>
      <p className="sustainabilityNotice">Bunlar ilan edilmiş sunucu etkinlikleri değildir. Takvime yalnız tarih ve yetkili duyuru kaynağı doğrulandığında “etkinlik” olarak eklenir.</p>
    </section>

    <section className="sustainabilitySection">
      <header><div><p>İLK UYGULAMA PAKETİ</p><h3>En düşük denge riskiyle başla.</h3></div><Link href="/?module=economy#economy">Tüm {loopRows.length} öneriyi incele →</Link></header>
      <div className="pilotLoopGrid">{pilotLoops.map((loop) => <article key={loop.id}><span><small>{loop.category} · {loop.lane}</small><b>{loop.shortTitle}</b></span><p>{loop.why}</p><div><small>GİRDİ</small><b>{loop.inputs.join(" · ")}</b></div><div><small>PARA ÇIKIŞI</small><b>{loop.coinSink}</b></div><footer><span>{loop.metric}</span>{loop.sourceIds.map(sourceFor).filter(Boolean).map((source) => source && <a href={source.url} target="_blank" rel="noreferrer" key={source.id}>{source.title} ↗</a>)}</footer></article>)}</div>
    </section>

    <section className="sustainabilitySection sourceAdaptation">
      <header><div><p>KAYNAK → İKV UYARLAMASI</p><h3>Fikrin nereden geldiği ve sınırı.</h3></div><span>Kaynak fikri doğrular; İKV’ye uygunluğu pilot ölçümü belirler.</span></header>
      <div className="adaptationTable" role="table" aria-label="Kaynak ve İKV uyarlaması">
        <div role="row" className="adaptationHead"><b role="columnheader">Kaynakta görülen</b><b role="columnheader">İKV’ye uyarlama</b><b role="columnheader">Koruma sınırı</b><b role="columnheader">Kaynak</b></div>
        {adaptations.map((row) => { const source = sourceFor(row.sourceId); return <div role="row" key={row.sourceId}><span role="cell">{row.sourceLesson}</span><span role="cell">{row.ikvUse}</span><span role="cell">{row.boundary}</span>{source ? <a role="cell" href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a> : <span role="cell">Kaynak bekliyor</span>}</div>; })}
      </div>
    </section>

    <div className="sustainabilityAction"><span><small>SAHADA UYGULA</small><b>Favori reçeteyi seç, stok gir, eksik rotayı çıkar.</b><p>Üretim Takip Masası; reçete hedefi, fotoğraf referansı, manuel stok, eksik kaynak ve sorumlu kişi takibini birleştirir.</p></span><Link href="/uretim#production-planner">Üretim takibine geç</Link></div>
  </section>;
}
