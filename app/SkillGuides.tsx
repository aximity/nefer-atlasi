"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import AbilityMediaShowcase from "./AbilityMediaShowcase";

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
    notes: [
      "Boz Ayı, Kanatma'nın aynı puanı kullanan varyantı olarak acil kontrol amacıyla tutulabilir.",
      "Sarsılmaz 1–15 seçimi grup stratejisine göre yapılabilir.",
      "Resmî kaynaklarda Süpürme Saldırısı / Süpürme Vuruşu adlarıyla geçen yetenek, hiddeti yeniden toplamak için kullanılabilir.",
    ],
  },
];

const regions: ("Tümü" | Region)[] = ["Tümü", "Çemberlitaş", "Migrat", "Sığınak"];
const classes: ("Tümü" | GuideClass)[] = ["Tümü", "Savaşçı", "Büyücü", "Şifacı"];

export default function SkillGuides() {
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
          <p className="eyebrow">KAYNAK GÖRÜNTÜLERİNDEN DERLENDİ</p>
          <h2>Bölgeye özel<br /><em>yetenek dizilimleri.</em></h2>
        </div>
        <p>
          Paylaşılan rehber ekranları yapılandırılmış notlara dönüştürüldü.
          Bunlar zorunlu meta değil; grup stratejisine göre değişebilen topluluk
          önerileridir.
        </p>
      </div>

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
            >
              <Image
                fill
                sizes="(max-width: 680px) 100vw, (max-width: 1020px) 50vw, 33vw"
                src={guide.image}
                alt={`${guide.region} ${guide.className} yetenek dizilimi kaynak fotoğrafı`}
              />
              <span>Kaynak görüntüsünü büyüt ↗</span>
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
