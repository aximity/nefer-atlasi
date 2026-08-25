"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { summarizeMarket } from "../lib/market-board.mjs";

type Currency = "Oyun parası" | "TL";
type Mode = "Tümü" | "Satış" | "İlan";
type PublishedRow = { id: string; type: string; subject: string; server: string; observedAt: string; sourceCount: number; details: Record<string, unknown> };

const watchlist = [
  { name: "Xenotim", source: "Büyük Hol · Saklı Tür", note: "150–200 TL · Ağustos 2026 tek oyuncu gözlemi", tone: "violet" },
  { name: "Peptit Kolorotoksin", source: "Büyük Hol · Akrepler", note: "Doğrulanmış fiyat gözlemi bekleniyor", tone: "amber" },
  { name: "Jadeit", source: "Büyük Hol · Yeşim Taşı 2. çıktısı", note: "Doğrulanmış fiyat gözlemi bekleniyor", tone: "green" },
  { name: "Erg Tozu", source: "Zihin Tapınağı · Yaratıklar", note: "Doğrulanmış fiyat gözlemi bekleniyor", tone: "cyan" },
  { name: "Erg Kalıntısı", source: "Zihin Tapınağı · Yaratıklar", note: "Doğrulanmış fiyat gözlemi bekleniyor", tone: "blue" },
] as const;

function price(value: number | null, currency: Currency) {
  if (value == null) return "Yetersiz veri";
  const formatted = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: currency === "TL" ? 2 : 0 }).format(value);
  return currency === "TL" ? `${formatted} TL` : formatted;
}

export default function MarketBoard({ query, setQuery }: { query: string; setQuery: (value: string) => void }) {
  const [rows, setRows] = useState<PublishedRow[]>([]);
  const [currency, setCurrency] = useState<Currency>("Oyun parası");
  const [mode, setMode] = useState<Mode>("Tümü");
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/contributions/published", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data) => {
        setRows(Array.isArray(data.rows) ? data.rows : []);
        setState("ready");
      })
      .catch((error) => {
        if (error?.name !== "AbortError") setState("unavailable");
      });
    return () => controller.abort();
  }, []);

  const summaries = useMemo(() => summarizeMarket(rows, { currency, mode })
    .filter((row) => row.subject.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR"))), [currency, mode, query, rows]);
  const shownWatchlist = watchlist.filter((row) => row.name.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR")));

  return <div className="mining-panel market-board">
    <div className="mining-panel-head"><div><span>M14 · ADİL OYUNCU PAZARI</span><h3>Çapraz doğrulanmış pazar nabzı</h3></div><label><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Malzeme veya eşya ara"/></label></div>
    <div className="market-board-controls">
      <div><span>PARA BİRİMİ</span>{(["Oyun parası", "TL"] as Currency[]).map((item) => <button key={item} className={currency === item ? "active" : ""} onClick={() => setCurrency(item)}>{item}</button>)}</div>
      <div><span>KAYIT TÜRÜ</span>{(["Tümü", "Satış", "İlan"] as Mode[]).map((item) => <button key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)}>{item}</button>)}</div>
      <Link href="/?module=contribute&kind=market_price#contribute">+ Fiyat gözlemi ekle</Link>
    </div>
    <div className="market-integrity-strip"><article><b>Satış ≠ ilan</b><span>Gerçekleşen satış ayrıca süzülür.</span></article><article><b>TL ≠ oyun parası</b><span>İki seri birbirine çevrilmez.</span></article><article><b>Medyan</b><span>Tek uç fiyat sonucu yönetmez.</span></article><article><b>Kanıt eşiği</b><span>Yalnız yayımlanmış çapraz kayıtlar.</span></article></div>

    {state === "loading" ? <div className="market-board-empty"><i>◇</i><b>Pazar kayıtları hazırlanıyor</b><span>Çapraz doğrulanmış gözlemler okunuyor.</span></div>
      : summaries.length > 0 ? <div className="market-summary-grid">{summaries.map((row) => <article key={`${row.subject}-${row.currency}`} className={`evidence-${row.evidence.level}`}>
        <header><span><small>{row.currency}</small><h4>{row.subject}</h4></span><b>{row.evidence.label}</b></header>
        <div className="market-price-main"><small>7 GÜNLÜK MEDYAN · BİRİM</small><strong>{price(row.sevenDayMedian, currency)}</strong><span>{row.sevenDayCount} gözlem</span></div>
        <dl><div><dt>30 gün</dt><dd>{price(row.thirtyDayMedian, currency)}</dd></div><div><dt>Kayıt</dt><dd>{row.totalCount}</dd></div><div><dt>Satış / ilan</dt><dd>{row.saleCount} / {row.listingCount}</dd></div><div><dt>Son gözlem</dt><dd>{row.latestAt}</dd></div></dl>
        <footer>{row.evidence.nextAt ? `Sonraki güven seviyesi için ${Math.max(0, row.evidence.nextAt - (row.thirtyDayCount || row.totalCount))} kayıt daha gerekli.` : "Yine de tek başına kesin piyasa fiyatı değildir."}</footer>
      </article>)}</div>
      : <><div className="market-board-empty"><i>◇</i><b>{state === "unavailable" ? "Pazar verisi şu an okunamadı" : "Bu filtrede yayımlanmış fiyat yok"}</b><span>Boşluğu tahminle doldurmuyoruz. İlk güvenilir medyan için bağımsız kanıtlı gözlemler gerekli.</span><Link href="/?module=contribute&kind=market_price#contribute">İlk gözlemi gönder ↗</Link></div>
      <div className="market-watchlist"><header><span>BAŞLANGIÇ TAKİP LİSTESİ</span><p>Bunlar fiyat sıralaması değildir; veri toplanması öncelikli malzemelerdir.</p></header><div>{shownWatchlist.map((item) => <article className={item.tone} key={item.name}><small>TAKİPTE</small><h4>{item.name}</h4><p>{item.source}</p><b>{item.note}</b></article>)}</div></div></>}

    <div className="fair-market-rules"><div><small>TEKEL VE MANİPÜLASYON KORUMASI</small><h4>Fiyat göster; fiyat belirleme.</h4></div><ol><li><b>01</b><span>Az veride “ucuz/pahalı” etiketi verme.</span></li><li><b>02</b><span>Aynı kanaldan gelen kayıtları bağımsız kaynak sayma.</span></li><li><b>03</b><span>Alıcı–satıcı iletişimini yayımlama; yalnız anonim fiyat özeti göster.</span></li><li><b>04</b><span>Otomatik alım, stok kapatma ve oyuncu adına teklif verme.</span></li></ol></div>
  </div>;
}
