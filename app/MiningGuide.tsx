"use client";

import { useMemo, useState } from "react";

type View = "Pazar" | "Bölgeler" | "Artırıcılar";

const regions = [
  { name: "Eminönü", mark: "EM", note: "Rota noktaları saha kaydı bekliyor" },
  { name: "Antrepo", mark: "AN", note: "Rota noktaları saha kaydı bekliyor" },
  { name: "Labirent", mark: "LB", note: "Rota noktaları saha kaydı bekliyor" },
  { name: "Meteor Bölgesi", mark: "MT", note: "Resmî kaynakta maden bakımından zengin" },
  { name: "Sivri Ada", mark: "SA", note: "Rota noktaları saha kaydı bekliyor" },
  { name: "Yeraltı", mark: "YA", note: "Yeraltı kaynaklarıyla ilişkilendiriliyor" },
  { name: "Büyük Hol", mark: "BH", note: "Eski Arz madenleri ve tünelleri" },
  { name: "Topkapı Sarayı", mark: "TS", note: "Rota noktaları saha kaydı bekliyor" },
  { name: "Karaköy", mark: "KK", note: "Kıyametin Öncüleri sunucusunda bulunmuyor" },
];

const materials = [
  { name: "Xenotim", kind: "Tılsım malzemesi", demand: "Çok sayıda sınıf tılsımı", game: "Veri bekleniyor", real: "150–200 TL", trend: "↓", status: "Kullanıcı gözlemi · Ağu 2026", tone: "violet" },
  { name: "Kondrit", kind: "Tılsım malzemesi", demand: "II–III kademe tılsım reçeteleri", game: "Veri bekleniyor", real: "Veri bekleniyor", trend: "—", status: "Reçete kullanımı doğrulandı", tone: "amber" },
  { name: "Gadolinyum", kind: "Nadir madenci çıktısı", demand: "Çeşitli sınıf tılsımları", game: "Veri bekleniyor", real: "Veri bekleniyor", trend: "—", status: "Monazit'in 2. seviye çıktısı", tone: "cyan" },
  { name: "Jadeit", kind: "Değerli taş / reçete girdisi", demand: "Çeşitli sınıf tılsımları", game: "Veri bekleniyor", real: "Veri bekleniyor", trend: "—", status: "Reçete kullanımı doğrulandı", tone: "green" },
  { name: "Saf Altın", kind: "Saf madenci çıktısı", demand: "Şaheser eşya üretimi", game: "Veri bekleniyor", real: "Veri bekleniyor", trend: "—", status: "Altın'ın 2. seviye çıktısı", tone: "gold" },
  { name: "Euksenit", kind: "Madenci kaynağı", demand: "Skandiyum / Yttrium çekimi", game: "Veri bekleniyor", real: "Veri bekleniyor", trend: "—", status: "50 toplama puanı", tone: "blue" },
];

const sources = {
  regions: "https://istanbulkiyametvakti.fandom.com/tr/wiki/Maden_Haritalar%C4%B1",
  officialRegions: "https://www.istanbuloyun.com/Regions.aspx",
  professions: "https://istanbulkiyametvakti.fandom.com/tr/wiki/Toplay%C4%B1c%C4%B1l%C4%B1k",
  recipes: "https://istanbulkiyametvakti.fandom.com/tr/wiki/B%C3%BCy%C3%BCc%C3%BC_-_T%C4%B1ls%C4%B1m_Re%C3%A7eteleri",
  boosters: "https://www.maxigamerz.com/konu/istanbul-kiyamet-vakti-ikv-dukkan-lonca-urunleri.240321/",
};

export default function MiningGuide() {
  const [view, setView] = useState<View>("Pazar");
  const [query, setQuery] = useState("");
  const shown = useMemo(() => materials.filter((item) => item.name.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr"))), [query]);

  return <section className="mining" id="mining">
    <div className="mining-hero">
      <div className="mining-kicker"><span>YENİ MODÜL</span> MADEN &amp; PAZAR TAKİBİ</div>
      <div className="mining-title">
        <div><h2>Farm rotanı<br/><em>veriyle kur.</em></h2><p>Kaynağın nerede bulunduğunu, neden değerli olduğunu ve fiyatın hangi tarihte gözlendiğini aynı ekranda karşılaştır.</p></div>
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
      <div className="mining-tabs" role="tablist">{(["Pazar","Bölgeler","Artırıcılar"] as View[]).map(x=><button key={x} className={view===x?"active":""} onClick={()=>setView(x)}>{x}</button>)}</div>

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

      {view === "Bölgeler" && <div className="mining-panel">
        <div className="mining-panel-head"><div><span>ŞEMATİK BÖLGE İNDEKSİ</span><h3>Maden rotaları</h3></div><a href={sources.regions} target="_blank" rel="noreferrer">Harita kaynağı ↗</a></div>
        <p className="schematic-note">Bu görünüm coğrafi koordinat haritası değildir. Yanlış nokta üretmemek için kesin damar konumları, gelecek ay yapılacak saha kayıtlarıyla adım adım işaretlenecek.</p>
        <div className="region-map">{regions.map((r,i)=><article className={(r.name==="Meteor Bölgesi"||r.name==="Büyük Hol")?"verified":""} key={r.name}><span>{String(i+1).padStart(2,"0")}</span><div className="region-mark">{r.mark}</div><h4>{r.name}</h4><p>{r.note}</p><small>{(r.name==="Meteor Bölgesi"||r.name==="Büyük Hol")?"Kaynaklı not":"Saha verisi bekleniyor"}</small></article>)}</div>
        <div className="field-log"><div><small>GELECEK AY · SAHA ŞABLONU</small><h4>Her turda dört şeyi kaydet</h4></div><ol><li><b>Konum</b><span>Bölge + ekran görüntüsü</span></li><li><b>Süre</b><span>Tur ve yeniden doğma zamanı</span></li><li><b>Çıktı</b><span>Normal / saf / nadir adet</span></li><li><b>Pazar</b><span>O gün görülen oyun parası fiyatı</span></li></ol></div>
      </div>}

      {view === "Artırıcılar" && <div className="mining-panel">
        <div className="mining-panel-head"><div><span>VERİM ÇARPANLARI</span><h3>Artırıcı rehberi</h3></div><a href={sources.boosters} target="_blank" rel="noreferrer">Kaynak ↗</a></div>
        <div className="booster-stack">
          <article><div className="booster-icon">60</div><div><small>KİŞİSEL · MADENCİ</small><h4>Madenci Şans Artırıcı %60</h4><p>Madenci kaynaklarında %60 ihtimalle iki torba; saf ve nadir maden çekme olasılığında artış sağlar.</p></div><span className="stack-badge">KİŞİSEL</span></article>
          <article><div className="booster-icon guild">60</div><div><small>LONCA · TÜM ÜYELER</small><h4>Lonca Madenci Şans Artırıcı %60</h4><p>Lonca üyelerine aynı kaynak avantajını sağlar ve kişisel Madenci Şans Artırıcı ile toplandığı belirtilir.</p></div><span className="stack-badge">TOPLANIR</span></article>
          <article className="booster-result"><div className="booster-icon result">+</div><div><small>FARM PLANI</small><h4>Önce test turu, sonra uzun farm</h4><p>Artırıcısız ve artırıcılı eşit sayıda tur kaydet. Torba, saf ve nadir sonuçlarını ayrı say; kârlılığı yalnız satış fiyatıyla değil saat başına çıktıyla ölç.</p></div></article>
        </div>
        <div className="source-strip"><span>Kaynak durumu</span><a href={sources.officialRegions} target="_blank" rel="noreferrer">Resmî bölgeler</a><a href={sources.professions} target="_blank" rel="noreferrer">Toplayıcılık tablosu</a><a href={sources.recipes} target="_blank" rel="noreferrer">Tılsım reçeteleri</a></div>
      </div>}
    </div>
  </section>;
}
