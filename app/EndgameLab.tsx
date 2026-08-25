"use client";

import { useState } from "react";

type Panel = "Simülasyon" | "Tier list" | "Ücretli QoL" | "Yol haritası";

const sourceLinks = {
  guide: "https://www.kiyametoyun.com/rehber",
  home: "https://kiyametoyun.net/",
  epin: "https://www.haydargame.com/kiyametin-onculeri-1000-akce-p-320",
  craftBag: "https://help.elderscrollsonline.com/app/answers/detail/a_id/34329/~/what-is-a-craft-bag-in-the-elder-scrolls-online",
  accountBank: "https://worldofwarcraft.blizzard.com/en-gb/news/24115313/get-the-band-together-for-warbands",
};

const paidIdeas = [
  {rank:"01",name:"Teşkilat Malzeme Çantası",tag:"EN YÜKSEK DEĞER",impact:"Çok yüksek",risk:"Çok düşük",effort:"Orta",text:"Madenci, Sarraf ve Lokman malzemelerini ayrı, hesap ortaklı ve otomatik istiflenen alanda tutar. Üretim, malzemeyi çantadan çıkarmadan yapabilir.",rule:"Kalıcı lisans veya üyelik bitince içindekiler alınabilir; yeni malzeme eklenemez."},
  {rank:"02",name:"Nefer Teçhizat Sayfaları",tag:"BUILD KONFORU",impact:"Yüksek",risk:"Düşük",effort:"Orta",text:"Sekiz yuvanın tamamını — gözlük, ceket, eldiven, pantolon, ayakkabı, yüzük, kolye ve silah — üç ila beş hazır sayfada saklar.",rule:"Yalnız güvenli bölgede değişir; ücretsiz yetenek sıfırlama veya savaş içi avantaj sağlamaz."},
  {rank:"03",name:"Lonca Lojistik Masası",tag:"SOSYAL ALTYAPI",impact:"Çok yüksek",risk:"Yok",effort:"Orta",text:"Grup bölgesi takvimi, rol kayıtları, ortak hedef, masraf/ganimet defteri ve lonca bankası hareket geçmişini bir araya getirir.",rule:"Lonca lisansı olarak satılabilir; savaş gücü değil organizasyon kalitesi sağlar."},
  {rank:"04",name:"Saha Defteri",tag:"FARM ARACI",impact:"Yüksek",risk:"Düşük",effort:"Düşük",text:"Kişisel harita işaretleri, rota sırası, tur kronometresi, maden çıktısı ve fiyat notlarını oyun içinde kaydeder.",rule:"Gizli kaynak veya kesin yeniden doğma zamanı göstermez; oyuncunun kendi verisini düzenler."},
  {rank:"05",name:"Pazar Gözcüsü",tag:"EKONOMİ",impact:"Yüksek",risk:"Orta",effort:"Yüksek",text:"Fiyat geçmişi, favori eşya listesi, ilan süresi ve oyun içi bildirim sunar. Xenotim gibi ürünlerde arz baskısını görünür kılar.",rule:"Otomatik satın alma, bot veya çevrimdışı ticaret yapmaz; yalnızca bilgi ve bildirim verir."},
];

const tiers = [
  {tier:"S",tone:"s",items:["Tank Savaşçı","Şifa / Koruma Şifacısı","Direnç Kırma Büyücüsü"],why:"Grubun çalışmasını mümkün kılan temel roller."},
  {tier:"A",tone:"a",items:["Yıldırım Hasar Büyücüsü","Kalabalık Kontrol Büyücüsü","Asit–Gazap Şifacısı"],why:"Kesim hızını ve güvenliğini ciddi biçimde yükseltir."},
  {tier:"B",tone:"b",items:["Ofansif Savaşçı","Zehir–Çağrı Şifacısı","Saf PvP dizilimleri"],why:"Güçlü olabilir; grup bölgesine ve kompozisyona daha bağımlıdır."},
];

export default function EndgameLab(){
  const [panel,setPanel]=useState<Panel>("Simülasyon");
  return <section className="endgame" id="endgame">
    <div className="endgame-shell">
      <header className="endgame-head">
        <div><p className="eg-kicker"><span>YÖNETİCİ RAPORU</span> ENDGAME LABORATUVARI</p><h2>Oyunun geleceğini<br/><em>ölçülebilir hâle getir.</em></h2></div>
        <div className="server-scope"><small>AKTİF KAPSAM</small><strong>Kıyametin Öncüleri</strong><div><span>49 SEVİYE</span><span>16 BÖLGE</span><span className="scope-off">KARAKÖY YOK</span></div><p>Bu rapor resmî İKV’nin 59 seviye Karaköy düzenini değil, mevcut sunucu kapsamını temel alır.</p></div>
      </header>

      <div className="eg-scorebar">
        <div><small>DÜNYA &amp; HİKÂYE</small><b>S</b><span>Özgün kimlik</span></div><div><small>SINIF KİMLİĞİ</small><b>A</b><span>Güçlü roller</span></div><div><small>ENDGAME ÇEŞİTLİLİĞİ</small><b>C+</b><span>Tekrar baskısı</span></div><div><small>KULLANICI DENEYİMİ</small><b>D+</b><span>Modernleşmeli</span></div><div className="potential"><small>POTANSİYEL</small><b>A+</b><span>Doğru yol haritasıyla</span></div>
      </div>

      <nav className="eg-tabs" aria-label="Endgame raporu bölümleri">{(["Simülasyon","Tier list","Ücretli QoL","Yol haritası"] as Panel[]).map(x=><button key={x} className={panel===x?"active":""} onClick={()=>setPanel(x)}>{x}</button>)}</nav>

      {panel==="Simülasyon"&&<div className="eg-panel simulation-panel">
        <div className="panel-intro"><div><small>MEVCUT OYUNCU DÖNGÜSÜ</small><h3>49’dan sonra oyuncu ne yapıyor?</h3></div><p>İdeal simülasyonda her faaliyet bir sonrakine hazırlanmalı. Mevcut yapıda sistemler güçlü; aralarındaki ilerleme bağı zayıf.</p></div>
        <div className="loop-line">
          <article><span>01</span><i>SV</i><h4>49. seviye</h4><p>Görev ve geçiş ekipmanı</p></article><article><span>02</span><i>GB</i><h4>Grup bölgeleri</h4><p>Sığınak · Migrat · Çemberlitaş</p></article><article><span>03</span><i>TL</i><h4>Tılsım &amp; build</h4><p>Rolü uzmanlaştırma</p></article><article><span>04</span><i>FR</i><h4>Farm &amp; üretim</h4><p>Ekonomi ve malzeme</p></article><article><span>05</span><i>Pv</i><h4>Lonca &amp; PvP</h4><p>Sosyal endgame</p></article>
        </div>
        <div className="diagnosis-grid"><article><b>Güçlü</b><h4>Sistemler birbirini tamamlıyor</h4><p>Tank, şifa, hasar, direnç kırma, tılsım ve meslekler doğru bir MMORPG omurgası kuruyor.</p></article><article><b>Darboğaz</b><h4>İlerleme aynı içeriğe dönüyor</h4><p>Grup bekleme, RNG ve yoğun farm; yeni build denemekten daha baskın hâle gelebiliyor.</p></article><article><b>Fırsat</b><h4>Eski içeriği sezonlaştırmak</h4><p>Yeni harita beklemeden değişken şef mekanikleri, bölge görevleri ve garanti jeton sistemi eklenebilir.</p></article></div>
        <div className="source-note"><span>Doğrulanan sunucu verisi</span><a href={sourceLinks.guide} target="_blank" rel="noreferrer">Kıyametin Öncüleri rehberi ↗</a><a href={sourceLinks.home} target="_blank" rel="noreferrer">Sunucu ana sayfası ↗</a></div>
      </div>}

      {panel==="Tier list"&&<div className="eg-panel tier-panel">
        <div className="panel-intro"><div><small>GRUP DEĞERİNE GÖRE</small><h3>PvE rol tier listesi</h3></div><p>Bu sıralama DPS sayacı değildir. Rolün grubu mümkün kılması, hata toleransı ve bölge uyumu esas alınmıştır.</p></div>
        <div className="tier-stack">{tiers.map(row=><article className={`tier-row ${row.tone}`} key={row.tier}><strong>{row.tier}</strong><div>{row.items.map(x=><span key={x}>{x}</span>)}</div><p>{row.why}</p></article>)}</div>
        <div className="tier-warning"><b>Önemli:</b> “En çok kullanılan” veya kesin hasar sıralaması, gerçek oyuncu verisi ve savaş kayıtları olmadan yayınlanmamalı. Site yalnız kaynaklı veriyle otomatik güncelleyecek.</div>
      </div>}

      {panel==="Ücretli QoL"&&<div className="eg-panel qol-panel">
        <div className="anka-review">
          <div className="anka-mark">A</div><div><small>MEVCUT YARDIMCI · OYUNCU GÖZLEMİ</small><h3>Anka doğru fikir, eksik paket.</h3><p>Yerdeki çantaları otomatik toplaması yirmi yıllık manuel tıklama yükünü azaltıyor. Bu temel konfor faydalı; fakat tek başına uzun süreli premium değer üretmiyor.</p></div><div className="anka-verdict"><small>KARAR</small><b>GEREKLİ QoL</b><span>Tek başına premium değil</span></div>
        </div>
        <div className="qol-principle"><b>Ödeme ilkesi</b><p>Para, oyuncuya daha yüksek hasar veya daha nadir ganimet değil; daha az menü, daha az bekleme ve daha iyi organizasyon satmalı.</p></div>
        <div className="idea-list">{paidIdeas.map(x=><article key={x.rank}><span className="idea-rank">{x.rank}</span><div className="idea-copy"><small>{x.tag}</small><h4>{x.name}</h4><p>{x.text}</p><em>{x.rule}</em></div><dl><div><dt>Fayda</dt><dd>{x.impact}</dd></div><div><dt>P2W riski</dt><dd>{x.risk}</dd></div><div><dt>Geliştirme</dt><dd>{x.effort}</dd></div></dl></article>)}</div>
        <div className="best-package"><div><small>ÖNERİLEN TEK ÜRÜN</small><h3>Nefer Lojistik Paketi</h3><p>Anka otomatik toplama + hesap ortaklı malzeme çantası + üç teçhizat sayfası + saha defteri + gelişmiş eşya filtresi.</p></div><div><span>KALICI</span><b>700–1.000 Akçe</b><small>Güç bonusu içermez</small></div></div>
        <div className="benchmark-links"><span>Model referansları</span><a href={sourceLinks.craftBag} target="_blank" rel="noreferrer">ESO malzeme çantası</a><a href={sourceLinks.accountBank} target="_blank" rel="noreferrer">WoW hesap ortak bankası</a><a href={sourceLinks.epin} target="_blank" rel="noreferrer">Akçe fiyat referansı</a></div>
      </div>}

      {panel==="Yol haritası"&&<div className="eg-panel roadmap-panel">
        <div className="panel-intro"><div><small>12 AYLIK UYGULANABİLİR PLAN</small><h3>Önce sürtünmeyi azalt, sonra içerik büyüt.</h3></div><p>Yeni bölge en pahalı çözümdür. Önce mevcut oyuncunun neden yorulduğunu düzeltmek daha yüksek geri dönüş sağlar.</p></div>
        <div className="roadmap">
          <article><span>0–3 AY</span><h4>Temel konfor</h4><ul><li>Anka filtre ve dolu çanta güvenliği</li><li>Eşya karşılaştırma</li><li>Grup rol ilanları</li><li>Sunucu kapsam ekranı</li></ul><b>P0</b></article>
          <article><span>3–6 AY</span><h4>Lojistik &amp; veri</h4><ul><li>Malzeme çantası</li><li>Teçhizat sayfaları</li><li>Lonca takvimi</li><li>Pazar fiyat geçmişi</li></ul><b>P1</b></article>
          <article><span>6–9 AY</span><h4>Endgame yenileme</h4><ul><li>Haftalık bölge mutasyonu</li><li>Garanti ilerleme jetonu</li><li>Rol bazlı başarılar</li><li>PvE/PvP ayrı denge</li></ul><b>P2</b></article>
          <article><span>9–12 AY</span><h4>Yeni dönem</h4><ul><li>Hikâye sezonu</li><li>Lonca seferleri</li><li>İstemci modernizasyonu</li><li>Yeni bölge hazırlığı</li></ul><b>P3</b></article>
        </div>
        <div className="success-metrics"><div><small>BAŞARI NASIL ÖLÇÜLÜR?</small><h4>Hisle değil, beş metrikle.</h4></div><ul><li><b>Grup kurma süresi</b><span>İlan → bölgeye giriş</span></li><li><b>Garanti ilerleme</b><span>Saat başına jeton</span></li><li><b>Build çeşitliliği</b><span>Kullanılan rol sayısı</span></li><li><b>Pazar sağlığı</b><span>Fiyat ve arz dağılımı</span></li><li><b>Oyuncu dönüşü</b><span>7 ve 30 günlük devam</span></li></ul></div>
      </div>}
    </div>
  </section>
}
