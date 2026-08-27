"use client";

import Image from "next/image";
import { type CSSProperties, useMemo, useState } from "react";
import AbilityMediaShowcase from "./AbilityMediaShowcase";
import AbilityReference from "./AbilityReference";
import AbilitySimulator from "./ability-simulator";

type GuideClass = "Savaşçı" | "Büyücü" | "Şifacı";
type Region = "Çemberlitaş" | "Migrat" | "Sığınak";
type Guide = {
  id: string;
  region: Region;
  className: GuideClass;
  title: string;
  role: string;
  resistance: string;
  image: string;
  previewFocus: string;
  notes: string[];
};

const guides: Guide[] = [
  {
    id: "ct-healer",
    region: "Çemberlitaş",
    className: "Şifacı",
    title: "Genel / Büyü Bozma",
    role: "Destek · Temizleme",
    resistance: "Ateş · Asit · Elektrik · Buz",
    image: "/references/cemberlitas-sifaci.jpg",
    previewFocus: "50% 58%",
    notes: [
      "GBM-X ve Yol Savaşçısı kesimlerinde Büyü Bozma 10/15 öne çıkıyor.",
      "İki şifacı varsa Element ve Fiziksel Direnç Alanı görevleri paylaşılabilir.",
      "Meditasyon kudret yenilenmesi; İyileştirme Çemberi kriz desteği olabilir.",
    ],
  },
  {
    id: "ct-mage",
    region: "Çemberlitaş",
    className: "Büyücü",
    title: "Hasar / Direnç Kırma / Büyü Bozma",
    role: "Üç farklı görev",
    resistance: "1. bölge Ateş–Asit · 2. bölge Elektrik–Buz",
    image: "/references/cemberlitas-buyucu.jpg",
    previewFocus: "50% 61%",
    notes: [
      "Büyücüler hasar, direnç kırma ve büyü bozma rollerine ayrılabiliyor.",
      "İkinci bölüm için kaynakta 200 Elektrik ve 40 Buz örneği veriliyor.",
      "Meteorit yüksek seviye tılsım istediğinde Yıldırım ve Buz alternatif oluyor.",
    ],
  },
  {
    id: "ct-warrior",
    region: "Çemberlitaş",
    className: "Savaşçı",
    title: "Tank Dizilimi",
    role: "Hiddet · Kontrol",
    resistance: "Bölüme göre değişken",
    image: "/references/cemberlitas-savasci.jpg",
    previewFocus: "50% 55%",
    notes: [
      "Temel görev tanklık ve düşman gruplarını Kışkırtma ile toplamaktır.",
      "Sarsılmaz kesimi rahatlatır; düşük puanda iksir ihtiyacı artabilir.",
      "Zihin Toplama, Korteks ve Ayartma etkilerine karşı önemlidir.",
    ],
  },
  {
    id: "migrat-mage",
    region: "Migrat",
    className: "Büyücü",
    title: "Genel / Direnç Kırma",
    role: "Kontrol · Destek Hasarı",
    resistance: "Elektrik",
    image: "/references/migrat-buyucu.jpg",
    previewFocus: "50% 56%",
    notes: [
      "Junon'un Meteorit ve Yıldırım saldırıları nedeniyle Elektrik direnci öne çıkıyor.",
      "Zihin Saldırısı 10/15 zayıf gruplarda kontrol amacıyla değerlendirilebilir.",
      "Tesla Küresi 1 puan ve Meditasyon ihtiyaca göre alternatif oluşturuyor.",
    ],
  },
  {
    id: "migrat-healer",
    region: "Migrat",
    className: "Şifacı",
    title: "Genel Şifa",
    role: "Şifa · Direnç Alanı",
    resistance: "Element / Fiziksel paylaşımı",
    image: "/references/migrat-sifaci.jpg",
    previewFocus: "50% 62%",
    notes: [
      "İki şifacı olduğunda direnç alanları iki oyuncu arasında paylaşılabilir.",
      "Ruh Kalkanı zırh desteği; Meditasyon kudret sorunu için alternatif olabilir.",
      "İyileştirme Çemberi güçlüdür ancak oluşturduğu hiddet nedeniyle kontrollü kullanılmalıdır.",
    ],
  },
  {
    id: "migrat-warrior",
    region: "Migrat",
    className: "Savaşçı",
    title: "Tank Dizilimi",
    role: "Toplama · Hiddet",
    resistance: "Elektrik odaklı",
    image: "/references/migrat-savasci.jpg",
    previewFocus: "50% 60%",
    notes: [
      "Kışkırtma ve Savaş Narası dağılımı grup stratejisine göre değişebilir.",
      "Depar grup bölgelerinde kullanılamadığı için dizilimin dışında tutuluyor.",
      "Zihin Toplama 1 yeterli görülürken kalan puanlar kontrole ayrılabilir.",
    ],
  },
  {
    id: "siginak-mage",
    region: "Sığınak",
    className: "Büyücü",
    title: "Genel / Direnç Kırma",
    role: "Kontrol · Elektrik",
    resistance: "200 Elektrik · kalan Asit",
    image: "/references/siginak-buyucu.jpg",
    previewFocus: "50% 58%",
    notes: [
      "Kaynak, 200 Elektrik ve kalan direnç puanlarının Asit olmasını öneriyor.",
      "Tesla Küresi baş döndürme ve yavaşlatma için 1 puanla kullanılabilir.",
      "Meditasyon kudret yenilenmesi ve büyü kritik desteği için seçilebilir.",
    ],
  },
  {
    id: "siginak-healer",
    region: "Sığınak",
    className: "Şifacı",
    title: "Genel Şifa",
    role: "Şifa · Alan Desteği",
    resistance: "Elektrik · Asit",
    image: "/references/siginak-sifaci.jpg",
    previewFocus: "50% 62%",
    notes: [
      "İki şifacı varsa Element ve Fiziksel Direnç Alanı görevleri paylaşılabilir.",
      "Ruh Kalkanı ve Meditasyon duruma bağlı alternatiflerdir.",
      "Çağrı, kudret maliyeti nedeniyle nadir tercih edilir.",
    ],
  },
  {
    id: "siginak-warrior",
    region: "Sığınak",
    className: "Savaşçı",
    title: "Tank Dizilimi",
    role: "Hiddet · Acil Kontrol",
    resistance: "Elektrik · Asit",
    image: "/references/siginak-savasci.jpg",
    previewFocus: "50% 58%",
    notes: [
      "Boz Ayı, Kanatma'nın aynı puanı kullanan varyantı olarak acil kontrol amacıyla tutulabilir.",
      "Sarsılmaz 1–15 seçimi grup stratejisine göre yapılabilir.",
      "Resmî kaynaklarda Süpürme Saldırısı / Süpürme Vuruşu adlarıyla geçen yetenek, hiddeti yeniden toplamak için kullanılabilir.",
    ],
  },
];

const regions: ("Tümü" | Region)[] = ["Tümü", "Çemberlitaş", "Migrat", "Sığınak"];
const classes: ("Tümü" | GuideClass)[] = ["Tümü", "Savaşçı", "Büyücü", "Şifacı"];

export default function SkillGuides({
  klass,
  onClassChange,
  initialAbilityId = "",
}: {
  klass: GuideClass;
  onClassChange: (klass: GuideClass) => void;
  initialAbilityId?: string;
}) {
  const [region, setRegion] = useState<(typeof regions)[number]>("Tümü");
  const [className, setClassName] = useState<(typeof classes)[number]>("Tümü");
  const [active, setActive] = useState<Guide | null>(null);
  const shown = useMemo(
    () =>
      guides.filter(
        (guide) =>
          (region === "Tümü" || guide.region === region) &&
          (className === "Tümü" || guide.className === className),
      ),
    [region, className],
  );

  return (
    <section className="skill-guides" id="skills">
      <div className="skill-head">
        <div>
          <p className="eyebrow">M31 · YETENEK LABORATUVARI</p>
          <h2>Puanını dağıt.<br /><em>Etkisini anında gör.</em></h2>
        </div>
        <p>
          Simülatör artık Tılsım bölümüne bağlı değil. Seviye ve sınıfını seç;
          puan bütçeni, açılan yetenekleri, etkin eşikleri ve sonraki kazanımı
          tek ekranda planla.
        </p>
      </div>

      <AbilitySimulator klass={klass} onClassChange={onClassChange} />

      <div className="skill-library-heading">
        <p className="eyebrow">OYUN İÇİ GÖRÜNTÜLERDEN DERLENDİ</p>
        <h3>Yetenek sözlüğü ve bölge dizilimleri</h3>
        <span>Simülasyonun altındaki kaynak kayıtları neyin neden değiştiğini doğrulamak içindir; topluluk dizilimleri zorunlu meta değildir.</span>
      </div>

      <AbilityReference initialClass={klass} focusAbilityId={initialAbilityId} />

      <AbilityMediaShowcase />

      <div className="skill-filters">
        <div>
          <small>BÖLGE</small>
          {regions.map((item) => (
            <button
              key={item}
              className={region === item ? "active" : ""}
              onClick={() => setRegion(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div>
          <small>SINIF</small>
          {classes.map((item) => (
            <button
              key={item}
              className={className === item ? "active" : ""}
              onClick={() => setClassName(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="guide-grid">
        {shown.map((guide) => (
          <article className="guide-card" key={guide.id}>
            <button
              className="guide-image"
              onClick={() => setActive(guide)}
              aria-label={`${guide.region} ${guide.className} kaynak görüntüsünü aç`}
              style={{ "--guide-focus": guide.previewFocus } as CSSProperties}
            >
              <Image
                fill
                sizes="(max-width: 680px) 100vw, (max-width: 1020px) 50vw, 33vw"
                src={guide.image}
                alt={`${guide.region} ${guide.className} yetenek dizilimi kaynak fotoğrafı`}
              />
              <span><b>KAYNAK KIRPIMI</b> Tam görüntüyü aç ↗</span>
            </button>
            <div className="guide-copy">
              <div className="guide-meta">
                <span>{guide.region}</span><b>{guide.className}</b>
              </div>
              <h3>{guide.title}</h3>
              <p>{guide.role}</p>
              <div className="resistance">
                <small>ÖNERİLEN DİRENÇ</small><strong>{guide.resistance}</strong>
              </div>
              <ul>{guide.notes.map((note) => <li key={note}>{note}</li>)}</ul>
              <div className="guide-source">◉ Kullanıcı tarafından sağlanan rehber görüntüsü</div>
            </div>
          </article>
        ))}
      </div>

      {active && (
        <div
          className="guide-modal"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setActive(null)
          }
        >
          <div>
            <button onClick={() => setActive(null)} aria-label="Kapat">×</button>
            <p>{active.region} · {active.className}</p>
            <h3>{active.title}</h3>
            <Image
              width={1200}
              height={1600}
              sizes="(max-width: 900px) 96vw, 850px"
              src={active.image}
              alt={`${active.region} ${active.className} kaynak görüntüsü`}
            />
            <small>Kaynak fotoğrafı · Metinler sitede özgün biçimde özetlenmiştir.</small>
          </div>
        </div>
      )}
    </section>
  );
}
