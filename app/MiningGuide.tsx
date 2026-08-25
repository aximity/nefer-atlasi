"use client";

import { useMemo, useState } from "react";

type View = "Pazar" | "Kaynaklar" | "Bölgeler" | "Artırıcılar";
type Profession = "Madenci" | "Sarraf";

const regions = [
  { name: "Eminönü", mark: "EM", note: "Bölge adı kaynaklı; damar noktaları saha kaydı bekliyor" },
  { name: "Antrepo", mark: "AN", note: "Bölge adı kaynaklı; damar noktaları saha kaydı bekliyor" },
  { name: "Labirent", mark: "LB", note: "Bölge adı kaynaklı; damar noktaları saha kaydı bekliyor" },
  { name: "Meteor Bölgesi", mark: "MT", note: "Resmî kaynakta maden bakımından zengin", verified: true },
  { name: "Sivri Ada", mark: "SA", note: "Bölge adı kaynaklı; damar noktaları saha kaydı bekliyor" },
  { name: "Yeraltı", mark: "YA", note: "Bölge adı kaynaklı; damar noktaları saha kaydı bekliyor" },
  { name: "Büyük Hol", mark: "BH", note: "Lojman madenleri alt rotası; Xenotim ve Jadeit oyuncu saha bilgisi", field: true },
  { name: "Topkapı Sarayı", mark: "TS", note: "Bölge adı kaynaklı; damar noktaları saha kaydı bekliyor" },
];

const materials = [
  { name: "Xenotim", kind: "Reçete malzemesi", demand: "Birden çok sınıfın tılsım reçetesinde geçiyor", game: "Veri bekleniyor", real: "150–200 TL", trend: "↓", status: "Büyük Hol · Lojman / oyuncu saha bilgisi", tone: "violet" },
  { name: "Kondrit", kind: "Reçete malzemesi", demand: "II–III kademe tılsım reçetelerinde geçiyor", game: "Veri bekleniyor", real: "Veri bekleniyor", trend: "—", status: "Toplayıcı türü ve bölgesi teyit bekliyor", tone: "amber" },
  { name: "Gadolinyum", kind: "Madenci çıktısı", demand: "Monazit kaynağının ikinci çıktısı", game: "Veri bekleniyor", real: "Veri bekleniyor", trend: "—", status: "45 toplama puanı · kaynaklı", tone: "cyan" },
  { name: "Jadeit", kind: "Sarraf çıktısı", demand: "Yeşim Taşı kaynağının ikinci çıktısı", game: "Veri bekleniyor", real: "Veri bekleniyor", trend: "—", status: "Büyük Hol · Lojman / oyuncu saha bilgisi", tone: "green" },
  { name: "Saf Altın", kind: "Madenci çıktısı", demand: "Altın kaynağının ikinci çıktısı", game: "Veri bekleniyor", real: "Veri bekleniyor", trend: "—", status: "23 toplama puanı · kaynaklı", tone: "gold" },
];

const collectionRows: { profession: Profession; base: string; second?: string; third?: string; points: number }[] = [
  { profession: "Madenci", base: "Bakır", second: "Saf Bakır", points: 1 },
  { profession: "Madenci", base: "Kalay", second: "Saf Kalay", points: 3 },
  { profession: "Madenci", base: "Kurşun", second: "Saf Kurşun", points: 5 },
  { profession: "Madenci", base: "Demir", second: "Saf Demir", points: 7 },
  { profession: "Madenci", base: "Nikel", second: "Saf Nikel", points: 10 },
  { profession: "Madenci", base: "Krom", second: "Saf Krom", points: 18 },
  { profession: "Madenci", base: "Gümüş", second: "Saf Gümüş", points: 20 },
  { profession: "Madenci", base: "Altın", second: "Saf Altın", points: 23 },
  { profession: "Madenci", base: "Tungsten", second: "Saf Tungsten", third: "Şelit", points: 30 },
  { profession: "Madenci", base: "Platin", second: "Saf Platin", points: 36 },
  { profession: "Madenci", base: "Titanyum", second: "Saf Titanyum", points: 40 },
  { profession: "Madenci", base: "Osmiridyum", second: "Osmiyum", third: "İridyum", points: 45 },
  { profession: "Madenci", base: "Monazit", second: "Gadolinyum", points: 45 },
  { profession: "Sarraf", base: "Kuvars", points: 1 },
  { profession: "Sarraf", base: "Obsidyen", points: 1 },
  { profession: "Sarraf", base: "Kan Taşı", points: 5 },
  { profession: "Sarraf", base: "Açık Mavi Lapis", second: "Koyu Mavi Lapis", points: 8 },
  { profession: "Sarraf", base: "Turkuaz", points: 10 },
  { profession: "Sarraf", base: "Ametist", second: "Açık Pempe Ametist", third: "Sibiryalı", points: 15 },
  { profession: "Sarraf", base: "Kalsedon", second: "Kripraz", third: "Akik", points: 21 },
  { profession: "Sarraf", base: "Elmas", second: "Yeşil Elmas", third: "Menekşe Elmas", points: 23 },
  { profession: "Sarraf", base: "Mavi Safir", second: "Turuncu Safir", points: 33 },
  { profession: "Sarraf", base: "Beril", second: "Yeşil Zümrüt", third: "Kızıl Zümrüt", points: 37 },
  { profession: "Sarraf", base: "Topaz", second: "Mavi Topaz", points: 40 },
  { profession: "Sarraf", base: "Krizoberil", second: "Alexandrite", points: 45 },
  { profession: "Sarraf", base: "Yeşim Taşı", second: "Jadeit", points: 45 },
];

const aboveCapRows = [
  { profession: "Madenci", chain: "Euksenit → Skandiyum → Yttrium", points: 50 },
  { profession: "Madenci", chain: "Lantan → Turyum → Erbium", points: 55 },
  { profession: "Sarraf", chain: "Fluorit → Mavi John → Taaffeite", points: 50 },
  { profession: "Sarraf", chain: "Bor → Ludwigite → Painite", points: 55 },
];

const sources = {
  regions: "https://istanbulkiyametvakti.fandom.com/tr/wiki/Maden_Haritalar%C4%B1",
  officialRegions: "https://www.istanbuloyun.com/Regions.aspx",
  professions: "https://istanbulkiyametvakti.fandom.com/tr/wiki/Toplay%C4%B1c%C4%B1l%C4%B1k",
  recipes: "https://istanbulkiyametvakti.fandom.com/tr/wiki/B%C3%BCy%C3%BCc%C3%BC_-_T%C4%B1ls%C4%B1m_Re%C3%A7eteleri",
  personalBooster: "https://www.istanbuloyun.com/News.aspx?NewsId=525",
  guildBooster: "https://istanbuloyun.com/News.aspx?NewsId=567",
};

export default function MiningGuide() {
  const [view, setView] = useState<View>("Pazar");
  const [query, setQuery] = useState("");
  const [profession, setProfession] = useState<Profession>("Madenci");
  const shown = useMemo(() => materials.filter((item) => item.name.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr"))), [query]);
  const collectionShown = useMemo(() => collectionRows.filter((item) => item.profession === profession && [item.base, item.second, item.third].filter(Boolean).join(" ").toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr"))), [profession, query]);

  return <section className="mining" id="mining">
    <div className="mining-hero">
      <div className="mining-kicker"><span>YENİ MODÜL</span> MADEN &amp; PAZAR TAKİBİ</div>
      <div className="mining-title">
        <div><h2>Farm rotanı<br/><em>veriyle kur.</em></h2><p>Kaynağın nerede bulunduğunu, neden değerli olduğunu ve fiyatın hangi tarihte gözlendiğini aynı ekranda karşılaştır.</p><a className="farm-ops-link" href="/farm-operasyonu">Saha Operasyonunu aç <span>↗</span></a></div>
        <div className="ore-orbit" aria-hidden="true"><span/><i>Xe</i><small>XENOTİM</small></div>
      </div>
      <div className="market-pulse">
        <div><small>TAKİPTEKİ MALZEME</small><strong>Xenotim</strong></div>
        <div><small>İLK ÇIKIŞ GÖZLEMİ</small><strong>≈ 400 TL</strong></div>
        <div><small>AĞUSTOS 2026 GÖZLEMİ</small><strong>150–200 TL</strong></div>
        <div className="pulse-down"><small>YÖN</small><strong>↓ Arz baskısı</strong></div>
      </div>
      <p className="market-disclaimer">Fiyatlar satıcı ilanı değildir. Reel para alanı yalnızca tarihli kullanıcı piyasa gözlemlerini arşivler; güvenli veya resmî ticaret garantisi vermez.</p>
    </div>

    <div className="mining-shell">
      <div className="mining-tabs" role="tablist">{(["Pazar","Kaynaklar","Bölgeler","Artırıcılar"] as View[]).map(x=><button key={x} className={view===x?"active":""} onClick={()=>{setView(x);setQuery("");}}>{x}</button>)}</div>

      {view === "Pazar" && <div className="mining-panel">
        <div className="mining-panel-head"><div><span>CANLI VERİ İSKELETİ</span><h3>Maden değer defteri</h3></div><label><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Malzeme ara"/></label></div>
        <div className="mineral-grid">{shown.map(item=><article className={`mineral-card ${item.tone}`} key={item.name}>
          <div className="mineral-top"><span className="mineral-gem">◆</span><span className="price-trend">{item.trend}</span></div>
          <small>{item.kind}</small><h4>{item.name}</h4><p>{item.demand}</p>
          <dl><div><dt>Oyun parası</dt><dd>{item.game}</dd></div><div><dt>Reel gözlem</dt><dd>{item.real}</dd></div></dl>
          <footer><i/> {item.status}</footer>
        </article>)}</div>
        <div className="value-logic"><div><span>01</span><h4>Reçete talebi</h4><p>Bir malzeme farklı sınıfların çok sayıda tılsım veya şaheser reçetesinde geçiyorsa sürekli talep görür.</p></div><div><span>02</span><h4>Erişim ve çekim</h4><p>Bölge erişimi, kaynak yoğunluğu, toplama puanı ve saf/nadir çekim olasılığı arzı belirler.</p></div><div><span>03</span><h4>Pazar baskısı</h4><p>Yoğun farm, rota tekeli ve stokların pazara aynı anda girmesi fiyatı aşağı çekebilir.</p></div></div>
      </div>}

      {view === "Kaynaklar" && <div className="mining-panel">
        <div className="mining-panel-head"><div><span>49 SEVİYE KAPSAM DENETİMİ</span><h3>Toplayıcılık kataloğu</h3></div><a href={sources.professions} target="_blank" rel="noreferrer">Ad tablosu ↗</a></div>
        <div className="collection-tools">
          <div>{(["Madenci","Sarraf"] as Profession[]).map(x=><button key={x} className={profession===x?"active":""} onClick={()=>setProfession(x)}>{x}</button>)}</div>
          <label><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Kaynak veya çıktı ara"/></label>
        </div>
        <p className="schematic-note">Adlar ve çıktı zincirleri Fandom Toplayıcılık tablosuyla karşılaştırıldı. Puan eşiği 45 ve altında olsa bile KÖ sunucusunda fiilî erişim ile kesin bölge noktası saha kaydı gelene kadar ayrı tutulur.</p>
        <div className="collection-list">{collectionShown.map(item=><article key={`${item.profession}-${item.base}`}>
          <div><small>{item.profession}</small><h4>{item.base}</h4></div>
          <div className="output-chain"><span>{item.base}</span>{item.second&&<><i>→</i><span>{item.second}</span></>}{item.third&&<><i>→</i><span>{item.third}</span></>}</div>
          <div className="point-pill"><b>{item.points}</b><small>puan</small></div>
          <p>Kesin KÖ bölgesi: <strong>{item.base === "Yeşim Taşı" ? "Büyük Hol · Lojman (oyuncu bilgisi)" : "saha teyidi bekliyor"}</strong></p>
        </article>)}</div>
        <div className="cap-warning"><div><small>49 ÜSTÜ REFERANS</small><h4>Aktif KÖ farm listesine alınmadı</h4></div><ul>{aboveCapRows.filter(x=>x.profession===profession).map(x=><li key={x.chain}><span>{x.chain}</span><b>{x.points} puan</b></li>)}</ul></div>
        <p className="source-typo-note">Kaynak tablosundaki “Açık Pempe Ametist” yazımı aynen korunmuştur; oyun içi ekran görüntüsüyle doğru yazım teyit edilene kadar düzeltilmiş gibi gösterilmez.</p>
      </div>}

      {view === "Bölgeler" && <div className="mining-panel">
        <div className="mining-panel-head"><div><span>ŞEMATİK BÖLGE İNDEKSİ</span><h3>Maden rotaları</h3></div><a href={sources.regions} target="_blank" rel="noreferrer">Harita kaynağı ↗</a></div>
        <p className="schematic-note">Bu görünüm coğrafi koordinat haritası değildir. Fandom indeksindeki bölge adları doğrulandı; kesin maden–bölge ve damar noktası eşlemesi saha kayıtları gelmeden doğrulanmış sayılmayacak.</p>
        <div className="ko-region-note"><b>Karaköy ayrımı</b><span>Normal İKV harita indeksinde var; Kıyametin Öncüleri sunucusunda olmadığı için aktif rota listesinden çıkarıldı.</span></div>
        <div className="region-map">{regions.map((r,i)=><article className={r.verified?"verified":r.field?"field":""} key={r.name}><span>{String(i+1).padStart(2,"0")}</span><div className="region-mark">{r.mark}</div><h4>{r.name}</h4><p>{r.note}</p><small>{r.verified?"Resmî bölge notu":r.field?"Oyuncu saha bilgisi":"Bölge adı kaynaklı"}</small></article>)}</div>
        <div className="field-log"><div><small>GELECEK AY · SAHA ŞABLONU</small><h4>Her turda dört şeyi kaydet</h4></div><ol><li><b>Konum</b><span>Bölge + ekran görüntüsü</span></li><li><b>Süre</b><span>Tur ve yeniden doğma zamanı</span></li><li><b>Çıktı</b><span>Normal / saf / nadir adet</span></li><li><b>Pazar</b><span>O gün görülen oyun parası fiyatı</span></li></ol></div>
      </div>}

      {view === "Artırıcılar" && <div className="mining-panel">
        <div className="mining-panel-head"><div><span>VERİM ÇARPANLARI</span><h3>Artırıcı rehberi</h3></div><a href={sources.personalBooster} target="_blank" rel="noreferrer">Resmî kaynak ↗</a></div>
        <div className="booster-stack">
          <article><div className="booster-icon">60</div><div><small>KİŞİSEL · RESMÎ İKV DUYURUSU</small><h4>Maden Şans Artırıcı %60</h4><p>Resmî İKV duyurusunda ürün %60 olarak listeleniyor. İki torba, saf/nadir çekim ve KÖ sunucusundaki tam formül henüz kaynakla doğrulanmadı.</p></div><span className="stack-badge">KÖ TESTİ BEKLİYOR</span></article>
          <article><div className="booster-icon guild">60</div><div><small>LONCA · RESMÎ İKV DUYURUSU</small><h4>Lonca Madenci Şans Artırıcı %60</h4><p>Resmî İKV duyurusunda ürün %60 olarak listeleniyor. Kişisel artırıcıyla KÖ sunucusunda nasıl birleştiği saha testi yapılmadan kesin kabul edilmeyecek.</p></div><span className="stack-badge">KÖ TESTİ BEKLİYOR</span></article>
          <article className="booster-result"><div className="booster-icon result">+</div><div><small>FARM PLANI</small><h4>Önce test turu, sonra uzun farm</h4><p>Artırıcısız ve artırıcılı eşit sayıda tur kaydet. Torba, saf ve nadir sonuçlarını ayrı say; kârlılığı yalnız satış fiyatıyla değil saat başına çıktıyla ölç.</p></div></article>
        </div>
        <div className="source-strip"><span>Kaynak durumu</span><a href={sources.personalBooster} target="_blank" rel="noreferrer">Kişisel %60 duyurusu</a><a href={sources.guildBooster} target="_blank" rel="noreferrer">Lonca %60 duyurusu</a><a href={sources.officialRegions} target="_blank" rel="noreferrer">Resmî bölgeler</a><a href={sources.professions} target="_blank" rel="noreferrer">Toplayıcılık tablosu</a><a href={sources.recipes} target="_blank" rel="noreferrer">Tılsım reçeteleri</a></div>
      </div>}
    </div>
  </section>;
}
