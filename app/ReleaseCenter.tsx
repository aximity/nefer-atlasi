"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE_RELEASE } from "../lib/site-release";

const previousReleases = [
  {
    version: "0.68.5",
    date: "30 Ağustos 2026",
    title: "Sıralı Yükseltme Dosyaları",
    changes: [
      "Altı KÖ ilerleme dosyası istenen sırada bulgu, güven sınırı ve güvenli hareketleriyle işlendi.",
      "+1 deneme kaydı, Gökmeran çelişkisi ve Malahit pazar sinyali kesin mekaniklerden ayrıldı.",
    ],
  },
  {
    version: "0.68.4",
    date: "30 Ağustos 2026",
    title: "Yükseltme Karar Merkezi",
    changes: [
      "+ basma, Kozmik Yükseltme ve dört bağlı KÖ başlığı tek karar ekranında toplandı.",
      "Her konu kesin bilgi, açık alan ve gereken kanıt ayrımıyla yayımlandı.",
    ],
  },
  {
    version: "0.68.3",
    date: "30 Ağustos 2026",
    title: "Çakışmasız Ticaret Arşivi",
    changes: [
      "21–30 Ağustos ticaret dışa aktarımları örtüşen mesajları şişirmeden birleştirildi.",
      "Fiyat–adet ve çok ürünlü ilan ayrıştırması kişisel veri taşımadan güvenli hâle getirildi.",
    ],
  },
  {
    version: "0.68.2",
    date: "29 Ağustos 2026",
    title: "Odaklı Menü ve Kaynaklı Görseller",
    changes: [
      "On beş modül silinmeden Bilgi, Araçlar ve Proje gruplarına ayrıldı.",
      "Bakır, Kalay ve Karbon doğrulanmış oyun ikonlarıyla ortak görsel ağına eklendi.",
    ],
  },
  {
    version: "0.68.1",
    date: "29 Ağustos 2026",
    title: "Güvenli Adet Onayı",
    changes: [
      "Sarı etiketli adetler kullanıcı doğrulaması olmadan stok veya üretim hesabına girmiyor.",
      "Etiketsiz tekli yuvalar 1 kalırken okunamayan etiketli miktarlar açık onaya bırakılıyor.",
    ],
  },
  {
    version: "0.68.0",
    date: "29 Ağustos 2026",
    title: "Fotoğraftan Gerçek Üretim Hesabı",
    changes: [
      "Sarı adet etiketleri için cihaz içi yedek okuyucu eklendi.",
      "Fotoğraf taslağı tüm reçete türlerinde üretilebilir azami adedi gösterdi.",
    ],
  },
  {
    version: "0.67.0",
    date: "29 Ağustos 2026",
    title: "Süre Sınırlı Fotoğraf Analizi",
    changes: [
      "Analiz aşaması, yüzdesi ve geçen süre gösterildi.",
      "Düşük güvenli ikonlar açık isim onayına taşındı.",
    ],
  },
  {
    version: "0.66.5",
    date: "29 Ağustos 2026",
    title: "Yanlış Adet Güvenlik Düzeltmesi",
    changes: [
      "Sarı adet etiketi okunamadığında miktar sessizce 1 kabul edilmiyor.",
      "Eksik adet tamamlanmadan fotoğraf taslağı stoka işlenmiyor.",
    ],
  },
  {
    version: "0.66.4",
    date: "29 Ağustos 2026",
    title: "Gerçek Fotoğraf Izgara Düzeltmesi",
    changes: [
      "Telefonla çekilmiş banka fotoğrafında doğru 8×8 sınırlar bulundu.",
      "Yarım hücre kayması ve parlak ikonların sahte ızgara sayılması engellendi.",
    ],
  },
  {
    version: "0.66.3",
    date: "29 Ağustos 2026",
    title: "Fotoğraftan Otomatik Çanta Okuma",
    changes: [
      "Izgara çizgileri katalog eşleşme kalitesiyle hizalanıyordu.",
      "Belirsiz ikon ve adet sonuçları güven eşiğinde tutuluyordu.",
    ],
  },
  {
    version: "0.66.2",
    date: "29 Ağustos 2026",
    title: "İkon ve Adet Güvenlik Düzeltmesi",
    changes: [
      "Belirsiz ikonlar yanlış adla onay taslağına alınmıyor.",
      "Adet yalnız hücrenin sol üstündeki rakam alanından okunuyor.",
    ],
  },
  {
    version: "0.66.1",
    date: "29 Ağustos 2026",
    title: "Net Fotoğraf Izgara Algılama Düzeltmesi",
    changes: [
      "Yumuşak ve kısmen örtülü çanta çizgileri hücre ritmine göre de algılanıyor.",
      "İkon parlamalarının oluşturduğu fazladan çizgiler ızgara dizisini bozmuyor.",
    ],
  },
  {
    version: "0.66.0",
    date: "29 Ağustos 2026",
    title: "Fotoğraftan Otomatik Çanta Okuma",
    changes: [
      "Fotoğraftaki çanta ızgarası ve doğrulanmış malzeme ikonları cihaz içinde otomatik karşılaştırılıyor.",
      "Tanınan sonuçlar stok değişmeden önce düzenlenebilir bir onay listesine geliyor.",
      "Manuel ikon kataloğu yalnız analiz sonucunu düzeltmek için kullanılıyor.",
    ],
  },
  {
    version: "0.65.0",
    date: "29 Ağustos 2026",
    title: "Kanıt Görevleri ve Akıllı Bildirim",
    changes: [
      "Atlas açıkları, gereken kanıt açıklaması doldurulmuş katkı formuna bağlandı.",
      "Geri bildirim formuna özel inceleme kuyruğuna giden oyun içi görsel yüklemesi eklendi.",
      "İksir ortak görsel kartlarının katalog derin bağlantısı düzeltildi.",
    ],
  },
  {
    version: "0.64.0",
    date: "29 Ağustos 2026",
    title: "Fotoğraftan Üretim Adayları",
    changes: [
      "Fotoğraf akışı görsel, ikon/adet, üretim adayı ve stok onayı olarak dört adıma ayrıldı.",
      "Taslak stok mevcut stokla birleşerek en yakın üç ila beş üretim adayını sıralıyor.",
      "Adaylar tamamlanma yüzdesi, eksik malzemeler ve site içi reçete bağlantısıyla gösteriliyor.",
    ],
  },
  {
    version: "0.62.0",
    date: "29 Ağustos 2026",
    title: "Tılsım Reçete ve Edinim Haritası",
    changes: [
      "710 tılsım reçetesi girdisinin tamamı 7 gerçek malzeme ve 6 sınıf/renk tılsım ikonuna bağlandı.",
      "110 önceki kademe tılsım görünen ad yerine kesin kimlikle bağlandı; aynı adlı sınıf varyantlarının birleşmesi önlendi.",
      "13 reçetenin kesin normal İKV kaynağı bulundu; iki ad-çakışmalı iddianın dört aday reçeteyi etkilediği ayrıştırıldı.",
      "KÖ oyuncu bildirimlerinin II–III. kademelere sızması engellendi; normal İKV, KÖ ve reçete drobu ayrı kanıt alanlarında gösterildi.",
    ],
  },
  {
    version: "0.61.0",
    date: "29 Ağustos 2026",
    title: "Maden Görseli Teslim Güvencesi",
    changes: [
      "95 gerçek malzeme ikonu doğrudan sayfa paketine bağlandı.",
      "Reçete, maden, stok ve fotoğraf akışı aynı gömülü ikon kaynağına geçirildi.",
      "Yayın sunucusundaki ayrı görsel isteğine bağlı bozuk ikon sorunu kapatıldı.",
    ],
  },
  {
    version: "0.46.0",
    date: "28 Ağustos 2026",
    title: "Ortak Üretim ve Görsel Ağı",
    changes: [
      "442 reçete ortak stok ve kullanım ağına geçirildi.",
      "48 Wiki malzeme ikonu reçete, stok, maden ve eksik listelerine bağlandı.",
      "Üretilebilir 53 önceki kademe tılsım kendi reçetesine geri bağlandı.",
    ],
  },
  {
    version: "0.45.0",
    date: "28 Ağustos 2026",
    title: "Ara Malzeme Zinciri",
    changes: [
      "Dokuz ara malzeme meslek, seviye ve alt girdileriyle üretime bağlandı.",
      "49 iksir malzemesinin 48'i edinme veya üretim kaynağıyla eşleşti.",
      "Karbon için doğrulanmamış kaynak tahmini yapılmadı.",
    ],
  },
  {
    version: "0.44.0",
    date: "28 Ağustos 2026",
    title: "Eksiksiz İksir Atlası",
    changes: [
      "28 kategorideki 246 iksir reçetesinin tamamı aktarıldı.",
      "581 malzeme/adet satırı stok hesabına bağlandı.",
      "Arama, favori ve üretim takibi aynı tam veri kümesine geçirildi.",
    ],
  },
  {
    version: "0.43.0",
    date: "28 Ağustos 2026",
    title: "Tam İksir Üretimi",
    changes: [
      "İksir dizini açılır reçete kartlarına dönüştürüldü.",
      "İksir favorileri üretim takibi ve stok hesabına bağlandı.",
      "Can, kudret ve destek görünüş aileleri tanımlandı.",
    ],
  },
  {
    version: "0.42.0",
    date: "28 Ağustos 2026",
    title: "Wiki Ana Kaynak Sistemi",
    changes: [
      "İKV Wiki tüm oyun verilerinde genel ana kaynak yapıldı.",
      "Projede bağlı 22 Wiki kaydı aynı güven politikasına geçirildi.",
      "Wiki dışı pazar ve oyuncu verileri ayrı tutuldu.",
    ],
  },
  {
    version: "0.41.2",
    date: "28 Ağustos 2026",
    title: "İksir Kaynak Kuralı",
    changes: [
      "İksir reçetelerinde İKV Wiki ana kaynak kabul edildi.",
      "İksir sekmesindeki ikinci kaynak teyidi şartı kaldırıldı.",
      "Aktarılmamış adetlerin tam reçete gibi görünmesi engellendi.",
    ],
  },
  {
    version: "0.41.1",
    date: "28 Ağustos 2026",
    title: "Yönlendirme ve Pazar Onarımı",
    changes: [
      "Tılsım, reçete, eşya ve Atlas derin bağlantıları onarıldı.",
      "Geri–ileri gezinme ve eşya penceresinin Esc ile kapanması düzeltildi.",
      "Fiyat gözlemi bağlantısı gerçek alış–satış formuna dönüştürüldü.",
    ],
  },
  {
    version: "0.41.0",
    date: "28 Ağustos 2026",
    title: "Ortak Görünüş Aileleri",
    changes: [
      "129 eşya 23 görünüş ailesine bağlandı; ortak gövde görselleri tekrar edilmedi.",
      "179 tılsım kırmızı ve mavi iki ortak görünüşe indirildi.",
      "İksirler için renk ve seviyeye bağlı boyut aileleri tanımlandı.",
    ],
  },
  {
    version: "0.40.0",
    date: "28 Ağustos 2026",
    title: "Sade Bilgi Mimarisi",
    changes: [
      "Ana ekran arama ve dört hızlı işe indirildi.",
      "Tılsım bilgisi, reçete kataloğu ve üretim takibi birbirinden ayrıldı.",
      "Boş medya yuvaları ve kaynaksız fiyat vitrini görünür akıştan kaldırıldı.",
    ],
  },
  {
    version: "0.39.0",
    date: "28 Ağustos 2026",
    title: "Tılsım Üretim Asistanı",
    changes: [
      "Üç sınıfın kaynakta listelenen tılsım reçeteleri üretim hesabına bağlandı.",
      "Tılsım favorileri ortak stok hesabına katıldı.",
      "Fotoğraftan bakarak manuel stok taslağı oluşturma akışı eklendi.",
    ],
  },
  {
    version: "0.37.0",
    date: "27 Ağustos 2026",
    title: "Piyasa ve Kullanım Nabzı",
    changes: [
      "Anonim WhatsApp verisi alış–satış liderlerine ve oranlarına dönüştürüldü.",
      "Yönetici paneline aktif kullanım süresi ve en çok vakit geçirilen bölümler eklendi.",
      "Gönül envanteri KÖ oyuncu bildirimiyle, doğrulama bekleyen kayıt olarak güncellendi.",
    ],
  },
  {
    version: "0.36.2",
    date: "27 Ağustos 2026",
    title: "KÖ Doğrulama Kapısı",
    changes: [
      "KÖ ile normal İKV edinme bilgileri birbirinden ayrıldı.",
      "Doğrulanmayan reçete malzemeleri ve adetler teyit bekliyor olarak işaretlendi.",
      "Katkı ekranı konu, yorum ve gönder düğmesine indirildi.",
    ],
  },
  {
    version: "0.36.1",
    date: "27 Ağustos 2026",
    title: "Sade Tılsım Rehberi",
    changes: [
      "Tılsım ekranı ne olduğu, kullanım amacı, edinme yolu ve reçete içeriğine indirildi.",
      "Yetenek puanı ve önce/sonra hesaplama kartları kaldırıldı.",
      "Favori ve Üretim Takibi bağlantısı korundu.",
    ],
  },
  {
    version: "0.36.0",
    date: "27 Ağustos 2026",
    title: "Tılsım Üretim Atlası",
    changes: [
      "179 tılsım için sınıf, renk ve kademe filtreleri eklendi.",
      "Önceki kademe, doğrulanmış Gönül kaydı ve üretim hedefleri bağlandı.",
      "Doğrulanmayan reçete malzemeleri hesap dışında bırakıldı.",
    ],
  },
  {
    version: "0.35.1",
    date: "27 Ağustos 2026",
    title: "Yenilikler Merkezi ve Hızlı Tanıtım",
    changes: [
      "İlk ziyaret için kısa, kapatılabilir tanıtım eklendi.",
      "Okunmamış sürümü işaretleyen kalıcı Yenilikler düğmesi hazırlandı.",
      "Güncel ve önceki önemli değişiklikler tek panelde birleştirildi.",
    ],
  },
  {
    version: "0.35.0",
    date: "27 Ağustos 2026",
    title: "Üretim Takibi ve Sürdürülebilirlik Merkezi",
    changes: [
      "Saha Operasyonu'na stok, favori reçete, hedef adet ve sorumlu kişi takibi eklendi.",
      "Eksik malzemeler bilinen edinme bölgeleri ve yaratıklarla eşleştirildi.",
      "Sürdürülebilirlik; ekonomi, etkinlik önerileri ve kaynak uyarlamalarını birleştirdi.",
    ],
  },
  {
    version: "0.34.3",
    date: "27 Ağustos 2026",
    title: "Wiki Set Görünüşleri",
    changes: [
      "Bıçak Sırtı set görünüşü, tekil eşya kanıtından ayrı bir görsel referans olarak eklendi.",
      "On bir görünüş ailesi için kaynak ve lisans kontrollü görsel kuyruğu kuruldu.",
    ],
  },
] as const;

const introKey = "nefer-intro-seen-v1";
const releaseKey = "nefer-release-seen";

export default function ReleaseCenter({ inline = false }: { inline?: boolean }) {
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setHasNew(localStorage.getItem(releaseKey) !== SITE_RELEASE.version);
    });
  }, []);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setUpdatesOpen(false);
        setIntroOpen(false);
      }
    };
    addEventListener("keydown", closeOnEscape);
    return () => removeEventListener("keydown", closeOnEscape);
  }, []);

  const openUpdates = () => {
    setUpdatesOpen(true);
    setHasNew(false);
    localStorage.setItem(releaseKey, SITE_RELEASE.version);
  };
  const closeIntro = () => {
    setIntroOpen(false);
    localStorage.setItem(introKey, "seen");
  };
  const replayIntro = () => {
    setUpdatesOpen(false);
    setIntroOpen(true);
  };

  return <>
    <button className={inline ? "releaseButton inline" : "releaseButton"} type="button" onClick={openUpdates} aria-label={`Yenilikleri aç${hasNew ? "; okunmamış güncelleme var" : ""}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/></svg>
      <span>Yenilikler</span>
      {hasNew && <i>Yeni</i>}
    </button>

    {introOpen && <section className="quickIntro" role="dialog" aria-modal="false" aria-labelledby="quick-intro-title">
      <button className="quickIntroClose" type="button" onClick={closeIntro} aria-label="Tanıtımı kapat">×</button>
      <header><small>60 SANİYELİK TANITIM</small><h2 id="quick-intro-title">Nefer Atlası ne yapar?</h2><p>Aradığın bilgiyi bulur, güvenini gösterir ve bir sonraki adımını planlamana yardım eder.</p></header>
      <div className="quickIntroSteps">
        <article><i>1</i><span><b>Bul</b><small>Üstteki aramaya eşya, görev, yetenek, maden veya boss yaz.</small></span></article>
        <article><i>2</i><span><b>Karar ver</b><small>Donanım, reçete, bölge ve kaynak bağlantılarını birlikte incele.</small></span></article>
        <article><i>3</i><span><b>Planla</b><small>Buildini, farm rotanı ve üretim eksiklerini takip et.</small></span></article>
      </div>
      <footer><button type="button" onClick={closeIntro}>Atlası kullanmaya başla</button><Link href="/rehber" onClick={closeIntro}>Detaylı rehber</Link></footer>
    </section>}

    {updatesOpen && <div className="releaseOverlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setUpdatesOpen(false)}>
      <aside className="releasePanel" role="dialog" aria-modal="true" aria-labelledby="release-title">
        <header><span><small>DEĞİŞİKLİK MERKEZİ</small><h2 id="release-title">Son yenilikler</h2></span><button type="button" onClick={() => setUpdatesOpen(false)} aria-label="Yenilikleri kapat">×</button></header>
        <section className="currentRelease"><div><small>{SITE_RELEASE.releasedAt} · {SITE_RELEASE.channel}</small><b>v{SITE_RELEASE.version}</b></div><h3>{SITE_RELEASE.title}</h3><p>{SITE_RELEASE.summary}</p><ul>{SITE_RELEASE.changes.map((change) => <li key={change}>{change}</li>)}</ul></section>
        <div className="releaseHistory">{previousReleases.map((release) => <details key={release.version}><summary><span><small>{release.date}</small><b>v{release.version} · {release.title}</b></span><i>+</i></summary><ul>{release.changes.map((change) => <li key={change}>{change}</li>)}</ul></details>)}</div>
        <footer><button type="button" onClick={replayIntro}>Kısa tanıtımı tekrar göster</button><Link href="/rehber">Tüm kullanım rehberi →</Link></footer>
      </aside>
    </div>}
  </>;
}
