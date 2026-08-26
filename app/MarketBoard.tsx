"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import marketArchive from "../data/market-whatsapp.json";
import { summarizeMarket } from "../lib/market-board.mjs";

type Currency = "Oyun parası" | "TL";
type Mode = "Tümü" | "Satış" | "İlan";
type Direction = "Tümü" | "Satılık" | "Alınır";
type PublishedRow = { id: string; type: string; subject: string; server: string; observedAt: string; sourceCount: number; details: Record<string, unknown> };

const archiveRows = marketArchive.priceObservations as PublishedRow[];
const watchlist = [
  { name: "Xenotim", source: "Büyük Hol · Saklı Tür", note: "WhatsApp arşivinde hem satılık hem alım fiyatı var", tone: "violet" },
  { name: "Peptit Kolorotoksin", source: "Büyük Hol · Akrepler", note: "Arz sinyali yüksek; fiyat örneklemi hâlâ sınırlı", tone: "amber" },
  { name: "Jadeit", source: "Büyük Hol · Yeşim Taşı 2. çıktısı", note: "Alım ve satım yönleri ayrı izleniyor", tone: "green" },
  { name: "Erg Tozu", source: "Zihin Tapınağı · Yaratıklar", note: "Yeni bölge verisi; tek kanal fiyatı kesin değer değildir", tone: "cyan" },
  { name: "Erg Kalıntısı", source: "Zihin Tapınağı · Yaratıklar", note: "Yeni bölge verisi; çapraz doğrulama bekleniyor", tone: "blue" },
] as const;

function price(value: number | null, currency: Currency) {
  if (value == null) return "Yetersiz veri";
  const formatted = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: currency === "TL" ? 2 : 0 }).format(value);
  return currency === "TL" ? `${formatted} TL` : `${formatted} Akçe`;
}

function shortDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
}

export default function MarketBoard({ query, setQuery }: { query: string; setQuery: (value: string) => void }) {
  const [rows, setRows] = useState<PublishedRow[]>(archiveRows);
  const [liveCount, setLiveCount] = useState(0);
  const [currency, setCurrency] = useState<Currency>("TL");
  const [mode, setMode] = useState<Mode>("İlan");
  const [direction, setDirection] = useState<Direction>("Satılık");
  const [state, setState] = useState<"loading" | "ready" | "archive-only">("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/contributions/published", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data) => {
        const published = Array.isArray(data.rows) ? data.rows as PublishedRow[] : [];
        setLiveCount(published.length);
        setRows([...archiveRows, ...published]);
        setState("ready");
      })
      .catch((error) => {
        if (error?.name !== "AbortError") setState("archive-only");
      });
    return () => controller.abort();
  }, []);

  const archiveAnchor = new Date(`${marketArchive.metadata.coverageEnd}T23:59:59Z`).getTime();
  const summaryAnchor = rows.reduce((latest, row) => Math.max(
    latest,
    new Date(`${row.observedAt}T23:59:59Z`).getTime() || 0,
  ), archiveAnchor);
  const summaries = useMemo(() => summarizeMarket(rows, {
    currency,
    mode,
    direction,
    now: summaryAnchor,
  }).filter((row) => row.subject.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR"))), [currency, direction, mode, query, rows, summaryAnchor]);
  const shownWatchlist = watchlist.filter((row) => row.name.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR")));
  const shownSignals = marketArchive.signals
    .filter((row) => row.subject.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR")))
    .slice(0, query ? 18 : 10);
  const maxSignal = Math.max(1, ...shownSignals.map((row) => row.buySignals + row.sellSignals));
  const archiveWindow = liveCount === 0;

  return <div className="mining-panel market-board">
    <div className="mining-panel-head"><div><span>M14 · ADİL OYUNCU PAZARI</span><h3>Anonim pazar nabzı</h3></div><label><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Malzeme veya eşya ara"/></label></div>

    <section className="market-archive-banner">
      <div><small>YENİ VERİ · WHATSAPP TİCARET ARŞİVİ</small><h4>{shortDate(marketArchive.metadata.coverageStart)}–{shortDate(marketArchive.metadata.coverageEnd)}</h4><p>{marketArchive.metadata.methodology}</p></div>
      <dl><div><dt>Mesaj</dt><dd>{marketArchive.metadata.messageCount.toLocaleString("tr-TR")}</dd></div><div><dt>Anonim sinyal</dt><dd>{marketArchive.metadata.tradeMessageCount}</dd></div><div><dt>Fiyat kesiti</dt><dd>{marketArchive.metadata.priceObservationCount}</dd></div><div><dt>Ürün</dt><dd>{marketArchive.signals.length}</dd></div></dl>
      <p className="market-privacy"><b>Kişisel veri taşınmadı.</b> {marketArchive.metadata.privacy} {state === "archive-only" && "Canlı topluluk kayıtlarına ulaşılamadığı için arşiv kesiti gösteriliyor."}</p>
    </section>

    <div className="market-board-controls">
      <div><span>PARA BİRİMİ</span>{(["TL", "Oyun parası"] as Currency[]).map((item) => <button key={item} className={currency === item ? "active" : ""} onClick={() => setCurrency(item)}>{item}</button>)}</div>
      <div><span>YÖN</span>{(["Satılık", "Alınır", "Tümü"] as Direction[]).map((item) => <button key={item} className={direction === item ? "active" : ""} onClick={() => setDirection(item)}>{item}</button>)}</div>
      <div><span>KAYIT TÜRÜ</span>{(["İlan", "Satış", "Tümü"] as Mode[]).map((item) => <button key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)}>{item}</button>)}</div>
      <Link href="/?module=contribute&kind=market_price#contribute">+ Fiyat gözlemi ekle</Link>
    </div>
    <div className="market-integrity-strip"><article><b>Alınır ≠ satılık</b><span>Alıcı teklifi ve satıcı beklentisi ayrı süzülür.</span></article><article><b>Satış ≠ ilan</b><span>Tamamlanan satış ayrıca işaretlenir.</span></article><article><b>TL ≠ Akçe</b><span>İki seri birbirine çevrilmez.</span></article><article><b>Tek kanal etiketi</b><span>WhatsApp kesiti çapraz doğrulanmış sayılmaz.</span></article></div>

    {summaries.length > 0 ? <div className="market-summary-grid">{summaries.map((row) => <article key={`${row.subject}-${row.currency}`} className={`evidence-${row.evidence.level}`}>
      <header><span><small>{row.currency} · {direction === "Tümü" ? "KARMA YÖN" : direction.toLocaleUpperCase("tr-TR")}</small><h4>{row.subject}</h4></span><b>{row.evidence.label}</b></header>
      <div className="market-price-main"><small>{archiveWindow ? "ARŞİVİN SON 7 GÜNÜ" : "7 GÜNLÜK MEDYAN"} · BİRİM</small><strong>{price(row.sevenDayMedian, currency)}</strong><span>{row.sevenDayCount} kaynak ağırlıklı gözlem</span></div>
      <dl><div><dt>30 gün</dt><dd>{price(row.thirtyDayMedian, currency)}</dd></div><div><dt>Gözlem</dt><dd>{row.totalCount}</dd></div><div><dt>Satış / ilan</dt><dd>{row.saleCount} / {row.listingCount}</dd></div><div><dt>Son gözlem</dt><dd>{shortDate(row.latestAt)}</dd></div></dl>
      <footer>{row.evidence.nextAt ? `Sonraki güven seviyesi için ${Math.max(0, row.evidence.nextAt - (row.thirtyDayCount || row.totalCount))} bağımsız destek daha gerekli.` : "Yine de tek başına kesin piyasa fiyatı değildir."}</footer>
    </article>)}</div>
      : <><div className="market-board-empty"><i>◇</i><b>Bu filtrede fiyat kesiti yok</b><span>Fiyatı tahminle doldurmuyoruz. Arz-talep sinyali aşağıda görülebilir; medyan için açık para birimli kayıt gerekir.</span><Link href="/?module=contribute&kind=market_price#contribute">Yeni gözlem gönder ↗</Link></div>
      <div className="market-watchlist"><header><span>DOĞRULAMA TAKİP LİSTESİ</span><p>Fiyat sıralaması değil; yeni bağımsız kayda ihtiyaç duyan ürünler.</p></header><div>{shownWatchlist.map((item) => <article className={item.tone} key={item.name}><small>TAKİPTE</small><h4>{item.name}</h4><p>{item.source}</p><b>{item.note}</b></article>)}</div></div></>}

    <section className="market-signal-board">
      <header><div><small>FİYATSIZ İLANLAR DA BOŞA GİTMİYOR</small><h4>Arz–talep hareketi</h4></div><p>Aynı kişinin aynı gün tekrarladığı ilan tek sayıldı. Bu tablo fiyat veya işlem hacmi değil, yalnız görünür ilgi sinyalidir.</p></header>
      <div>{shownSignals.map((row) => {
        const total = row.buySignals + row.sellSignals;
        return <article key={row.subject}><span><b>{row.subject}</b><small>{row.activeDays} aktif gün · {row.independentParticipants} anonim katılımcı</small></span><div className="signal-bars"><i className="buy" style={{ width: `${row.buySignals / maxSignal * 100}%` }}/><i className="sell" style={{ width: `${row.sellSignals / maxSignal * 100}%` }}/></div><dl><div><dt>Alınır</dt><dd>{row.buySignals}</dd></div><div><dt>Satılık</dt><dd>{row.sellSignals}</dd></div><div><dt>Toplam</dt><dd>{total}</dd></div></dl></article>;
      })}</div>
    </section>

    <div className="fair-market-rules"><div><small>TEKEL VE MANİPÜLASYON KORUMASI</small><h4>Fiyat göster; fiyat belirleme.</h4></div><ol><li><b>01</b><span>Az veride “ucuz/pahalı” etiketi verme.</span></li><li><b>02</b><span>Aynı kişinin günlük tekrarlarını yeni kaynak sayma.</span></li><li><b>03</b><span>Ad, telefon, sohbet metni ve özel bağlantı yayımlama.</span></li><li><b>04</b><span>Otomatik alım, stok kapatma ve oyuncu adına teklif verme.</span></li></ol></div>
  </div>;
}
