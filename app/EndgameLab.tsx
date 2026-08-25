"use client";

import { useState } from "react";

type Panel = "Durum" | "Sorunlar" | "Roller" | "Premium" | "Yol haritası";
type IssueId = "repeat" | "group" | "economy" | "anka" | "client";

const sourceLinks = {
  guide: "https://www.kiyametoyun.com/rehber",
  home: "https://kiyametoyun.net/",
  craftBag:
    "https://help.elderscrollsonline.com/app/answers/detail/a_id/34329/~/what-is-a-craft-bag-in-the-elder-scrolls-online",
  accountBank:
    "https://worldofwarcraft.blizzard.com/en-gb/news/24115313/get-the-band-together-for-warbands",
  partyFinder: "https://na.finalfantasyxiv.com/game_manual/pp/",
  armory: "https://www.elderscrollsonline.com/en-us/updates",
  weeklyObjectives: "https://www.guildwars2.com/en-gb/secrets-of-the-obscure/",
  weeklyChoice: "https://worldofwarcraft.blizzard.com/en-us/news/23778646/",
};

const problems: Array<{
  id: IssueId;
  short: string;
  title: string;
  observation: string;
  guardrail: string;
  ideas: Array<{ name: string; basis: string; pilot: string }>;
}> = [
  {
    id: "repeat",
    short: "Tekrar",
    title: "Endgame aynı içeriğe dönüyor",
    observation:
      "Yeni bölge üretmeden de mevcut Sığınak, Migrat ve Çemberlitaş tekrar oynanabilir hâle getirilebilir.",
    guardrail:
      "Ödül gücü sürekli yükselmemeli; çeşitlilik mekanik, rota ve hedef üzerinden gelmeli.",
    ideas: [
      {
        name: "Haftalık bölge mutasyonu",
        basis: "Her hafta tek bir mekanik değişir: konum, direnç, ek saldırı veya süre hedefi.",
        pilot: "Önce tek bölgede 4 haftalık rotasyon.",
      },
      {
        name: "Bölge sözleşmeleri",
        basis: "Oyuncuya öldürme dışında koruma, süre, kayıpsız tamamlama veya rol hedefi verir.",
        pilot: "Haftada üç görev; kozmetik ve üretim ödülü.",
      },
      {
        name: "Kademeli zorluk",
        basis: "Aynı harita için normal, uzman ve meydan okuma kuralları içerik ömrünü uzatır.",
        pilot: "Can şişirmek yerine bir yeni mekanik ekle.",
      },
      {
        name: "Eski bölge rotasyonu",
        basis: "Haftanın bölgesine fazladan jeton vererek oyuncu nüfusunu tek noktada toplar.",
        pilot: "Ödül farkını küçük tut; zorunluluk yaratma.",
      },
      {
        name: "Takım rekorları",
        basis: "Süre, kayıpsız bitiriş ve farklı sınıf bileşimi yeni hedef üretir.",
        pilot: "Güç ödülü yok; unvan, görünüm ve arşiv kaydı.",
      },
    ],
  },
  {
    id: "group",
    short: "Grup",
    title: "Grup kurmak içerikten uzun sürebiliyor",
    observation:
      "Rol ihtiyacı görünür değilse oyuncu sohbet takibi yapar, eksik rolü geç fark eder ve grup dağılır.",
    guardrail:
      "Otomatik eşleştirme şart değil; ilk sürüm yalnız ilan, rol ve hazır kontrolü olabilir.",
    ideas: [
      {
        name: "Rol bazlı grup ilanı",
        basis: "Bölge, hedef, sınıf, rol ve saat tek ilanda görünür.",
        pilot: "Sadece üç grup bölgesiyle başla.",
      },
      {
        name: "Hazır kontrolü",
        basis: "Lider tek tuşla hazır, eksik eşya ve bağlantı durumunu görür.",
        pilot: "İlk sürüm yalnız hazır / değil sinyali.",
      },
      {
        name: "Grup şablonları",
        basis: "Lider sık kullandığı tank, şifa, hasar ve direnç kırma dağılımını kaydeder.",
        pilot: "Üç ücretsiz şablon yeterli.",
      },
      {
        name: "Yedek oyuncu kuyruğu",
        basis: "Ayrılan oyuncunun rolüne uygun gönüllü yedek çağrılır.",
        pilot: "Otomatik ışınlama olmadan bildirim sistemi.",
      },
      {
        name: "Bağlantı sonrası geri dönüş",
        basis: "Kopan oyuncuya kısa süre aynı gruba ve örneğe dönme hakkı verir.",
        pilot: "Önce grup kimliğini 5 dakika sakla.",
      },
    ],
  },
  {
    id: "economy",
    short: "Ekonomi",
    title: "Farm tekeli ve belirsiz fiyat güveni azaltıyor",
    observation:
      "Sorun yalnız düşük fiyat değildir; az sayıda rota, fiyat geçmişinin olmaması ve malzeme talebinin dar kalmasıdır.",
    guardrail:
      "Yönetici fiyat belirlememeli ve otomatik satın alma eklenmemeli; sistem bilgi ve alternatif üretmeli.",
    ideas: [
      {
        name: "Gerçekleşen fiyat geçmişi",
        basis: "İlan değil, tamamlanan satışların medyanı ve adedi gösterilir.",
        pilot: "Önce en çok işlem gören 20 malzeme.",
      },
      {
        name: "Dağıtılmış maden noktaları",
        basis: "Aynı kaynağın birden fazla rotada bulunması tek noktayı tutmayı zorlaştırır.",
        pilot: "Konumları haftalık değil, kontrollü havuzdan seç.",
      },
      {
        name: "Üretim siparişi panosu",
        basis: "Alıcı malzeme ve ücret koyar; üretici hizmet verir. Talep görünür olur.",
        pilot: "Bağlayıcı olmayan ilan panosuyla başla.",
      },
      {
        name: "Alternatif jeton yolu",
        basis: "Darboğaz malzemesi sınırlı haftalık jetonla alınabilir; farm değerini yok etmez.",
        pilot: "Haftalık düşük limit ve piyasa izleme.",
      },
      {
        name: "Kalıcı malzeme tüketimi",
        basis: "Lonca dekoru, görünüm ve etkinlik katkısı stok fazlasını savaş gücü satmadan eritir.",
        pilot: "Tek bir lonca projesiyle talebi ölç.",
      },
    ],
  },
  {
    id: "anka",
    short: "Anka",
    title: "Anka tıklamayı azaltıyor, sistemi tamamlamıyor",
    observation:
      "Otomatik çanta toplama gerekli bir konfor iyileştirmesi; değer, hangi çantanın toplandığı ve sonrasında ne kadar işlem gerektiğiyle ölçülmeli.",
    guardrail:
      "Pet ganimet şansını, düşen adedi, hareket hızını veya savaş gücünü artırmamalı.",
    ideas: [
      {
        name: "Gelişmiş ganimet filtresi",
        basis: "Tür, nadirlik ve beyaz listeye göre toplar; çöpleri çantaya doldurmaz.",
        pilot: "Filtre kapalıyken mevcut davranış korunur.",
      },
      {
        name: "Dolu çanta güvenliği",
        basis: "Kritik eşya yerdeyken uyarır, düşük öncelikli toplamayı durdurur.",
        pilot: "Silme veya satma otomasyonu olmadan.",
      },
      {
        name: "Otomatik istifleme",
        basis: "Aynı malzemeleri birleştirir ve maden / üretim / görev olarak ayırır.",
        pilot: "Yalnız mevcut çanta kuralları içinde.",
      },
      {
        name: "Hesap ortaklı malzeme çantası",
        basis: "Karakterler arası aktarma yükünü azaltır; üretim doğrudan buradan okuyabilir.",
        pilot: "Önce sınırlı malzeme kategorisi.",
      },
      {
        name: "Tur özeti",
        basis: "Süre, toplanan adet ve nadir çıktı raporu farm verimini görünür kılar.",
        pilot: "Kişisel veri; konum ve doğma zamanı paylaşmaz.",
      },
    ],
  },
  {
    id: "client",
    short: "İstemci",
    title: "Eski istemci temel sürtünmeler üretiyor",
    observation:
      "Büyük motor yenilemesi uzun ve risklidir. Önce oyuncunun her gün karşılaştığı küçük kayıplar hedeflenmeli.",
    guardrail:
      "Her iyileştirme ayrı açılıp kapatılabilmeli ve eski arayüz davranışı geri alınabilmeli.",
    ideas: [
      {
        name: "Arayüz ölçekleme",
        basis: "Metin, çanta ve yetenek paneli farklı ekranlarda okunur kalır.",
        pilot: "Yüzde 80 / 100 / 120 seçenekleri.",
      },
      {
        name: "Tuş profilleri",
        basis: "PvE, PvP ve farm için ayarlar kaydedilir; yeniden kurulum azalır.",
        pilot: "Üç yerel profil.",
      },
      {
        name: "Eşya karşılaştırma",
        basis: "Takılı ve seçilen eşyanın farkları aynı pencerede renkli gösterilir.",
        pilot: "Yalnız doğrulanmış sayısal alanlar.",
      },
      {
        name: "Çökme sonrası ganimet koruması",
        basis: "Hak edilmiş fakat alınamamış ödül geçici teslim kutusuna gider.",
        pilot: "Sadece grup bölgesi son sandığı.",
      },
      {
        name: "Bağlantı sağlık göstergesi",
        basis: "Gecikme ve paket kaybı görünür olur; oyuncu oyun hatasıyla ağ sorununu ayırır.",
        pilot: "Basit üç durum: iyi, dalgalı, kötü.",
      },
    ],
  },
];

const paidIdeas = [
  {
    name: "Malzeme çantası",
    value: "Çok yüksek",
    risk: "Çok düşük",
    rule: "Güç vermez; yalnız hesap ortaklı saklama ve üretim erişimi sağlar.",
  },
  {
    name: "Teçhizat sayfaları",
    value: "Yüksek",
    risk: "Düşük",
    rule: "Sekiz yuvayı kaydeder; yalnız güvenli bölgede değişir.",
  },
  {
    name: "Saha defteri",
    value: "Yüksek",
    risk: "Yok",
    rule: "Oyuncunun kendi rota, süre ve fiyat notlarını düzenler.",
  },
  {
    name: "Lonca lojistik masası",
    value: "Çok yüksek",
    risk: "Yok",
    rule: "Takvim, rol, masraf ve ortak hedefi bir araya getirir.",
  },
  {
    name: "Pazar favorileri",
    value: "Orta",
    risk: "Düşük",
    rule: "Yalnız fiyat geçmişi ve bildirim; otomatik alım yapmaz.",
  },
];

const roleRows = [
  {
    label: "Temel roller",
    tone: "required",
    items: ["Tank Savaşçı", "Şifa Şifacısı", "Direnç Kırma Büyücüsü"],
    why: "Grubun hayatta kalması ve mekanikleri tamamlaması için ilk test edilecek omurga.",
  },
  {
    label: "Hızlandırıcı roller",
    tone: "support",
    items: ["Yıldırım Hasar", "Kontrol Büyücüsü", "Asit–Gazap Şifacısı"],
    why: "Kesim süresi, güvenlik ve takım uyumuna katkısı ölçülmeli.",
  },
  {
    label: "Duruma bağlı",
    tone: "situational",
    items: ["Ofansif Savaşçı", "Zehir–Çağrı Şifacısı", "Saf PvP dizilimleri"],
    why: "Bölge, ekipman ve takım stratejisine göre değer kazanabilir.",
  },
];

export default function EndgameLab() {
  const [panel, setPanel] = useState<Panel>("Durum");
  const [issue, setIssue] = useState<IssueId>("repeat");
  const activeProblem = problems.find((item) => item.id === issue) ?? problems[0];

  return (
    <section className="endgame" id="endgame">
      <div className="endgame-shell">
        <header className="endgame-head">
          <div>
            <p className="eg-kicker">
              <span>YÖNETİCİ RAPORU</span> ENDGAME LABORATUVARI
            </p>
            <h2>
              Varsayımı ayır.
              <br />
              <em>Çözümü test et.</em>
            </h2>
          </div>
          <div className="server-scope">
            <small>AKTİF KAPSAM</small>
            <strong>Kıyametin Öncüleri</strong>
            <div>
              <span>49 SEVİYE</span>
              <span>16 BÖLGE</span>
              <span className="scope-off">KARAKÖY YOK</span>
            </div>
            <p>
              Sunucu kapsamı kaynaklıdır. Anka değerlendirmesi oyuncu gözlemidir;
              rol ve ürün önerileri doğrulanması gereken tasarım hipotezleridir.
            </p>
          </div>
        </header>

        <div className="evidence-strip" aria-label="Kanıt düzeyi">
          <div>
            <small>SUNUCU KAPSAMI</small>
            <b>Kaynaklı</b>
          </div>
          <div>
            <small>ANKA</small>
            <b>Oyuncu gözlemi</b>
          </div>
          <div>
            <small>ROL MATRİSİ</small>
            <b>Test hipotezi</b>
          </div>
          <div>
            <small>FİYATLANDIRMA</small>
            <b>Pilot gerekli</b>
          </div>
        </div>

        <nav className="eg-tabs" role="tablist" aria-label="Endgame raporu bölümleri">
          {(["Durum", "Sorunlar", "Roller", "Premium", "Yol haritası"] as Panel[]).map(
            (item) => (
              <button
                key={item}
                role="tab"
                aria-selected={panel === item}
                className={panel === item ? "active" : ""}
                onClick={() => setPanel(item)}
              >
                {item}
              </button>
            ),
          )}
        </nav>

        {panel === "Durum" && (
          <div className="eg-panel simulation-panel">
            <div className="panel-intro">
              <div>
                <small>MEVCUT OYUNCU DÖNGÜSÜ</small>
                <h3>49’dan sonra oyuncu ne yapıyor?</h3>
              </div>
              <p>
                Sistemlerin temeli güçlü. Sorun; grup bekleme, tekrar, envanter
                sürtünmesi ve belirsiz ilerlemenin yeni build denemesini gölgede
                bırakabilmesi.
              </p>
            </div>
            <div className="loop-line">
              <article><span>01</span><i>SV</i><h4>49. seviye</h4><p>Görev ve geçiş ekipmanı</p></article>
              <article><span>02</span><i>GB</i><h4>Grup bölgeleri</h4><p>Sığınak · Migrat · Çemberlitaş</p></article>
              <article><span>03</span><i>TL</i><h4>Tılsım &amp; build</h4><p>Rolü uzmanlaştırma</p></article>
              <article><span>04</span><i>FR</i><h4>Farm &amp; üretim</h4><p>Ekonomi ve malzeme</p></article>
              <article><span>05</span><i>Pv</i><h4>Lonca &amp; PvP</h4><p>Sosyal endgame</p></article>
            </div>
            <div className="decision-rule">
              <b>Karar kuralı</b>
              <p>
                Önce düşük motor bağımlılığı olan özellik denenir. Oyuncu süresi,
                grup kurma ve tekrar oynama iyileşmiyorsa büyük yatırım yapılmaz.
              </p>
            </div>
            <div className="source-note">
              <span>Sunucu kaynakları</span>
              <a href={sourceLinks.guide} target="_blank" rel="noreferrer">Rehber ↗</a>
              <a href={sourceLinks.home} target="_blank" rel="noreferrer">Ana sayfa ↗</a>
            </div>
          </div>
        )}

        {panel === "Sorunlar" && (
          <div className="eg-panel problems-panel">
            <div className="panel-intro">
              <div>
                <small>5 SORUN · HER BİRİNE 5 ALTERNATİF</small>
                <h3>Tek fikre bağımlı kalma.</h3>
              </div>
              <p>
                Her öneri küçük pilotla denenebilir, geri alınabilir ve güç
                satmadan oyuncu değerini artıracak şekilde sınırlandırılmıştır.
              </p>
            </div>
            <div className="problem-tabs" role="tablist" aria-label="Sorun seç">
              {problems.map((item) => (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={issue === item.id}
                  className={issue === item.id ? "active" : ""}
                  onClick={() => setIssue(item.id)}
                >
                  {item.short}
                </button>
              ))}
            </div>
            <div className="problem-summary">
              <div>
                <small>MEVCUT SORUN</small>
                <h4>{activeProblem.title}</h4>
                <p>{activeProblem.observation}</p>
              </div>
              <aside>
                <small>KIRMIZI ÇİZGİ</small>
                <p>{activeProblem.guardrail}</p>
              </aside>
            </div>
            <div className="solution-grid">
              {activeProblem.ideas.map((idea, index) => (
                <article key={idea.name}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h4>{idea.name}</h4>
                  <p>{idea.basis}</p>
                  <small>PİLOT</small>
                  <b>{idea.pilot}</b>
                </article>
              ))}
            </div>
            <div className="benchmark-links">
              <span>Dayanak örnekleri</span>
              <a href={sourceLinks.partyFinder} target="_blank" rel="noreferrer">FFXIV grup bulucu</a>
              <a href={sourceLinks.weeklyObjectives} target="_blank" rel="noreferrer">GW2 haftalık hedefler</a>
              <a href={sourceLinks.weeklyChoice} target="_blank" rel="noreferrer">WoW ödül seçimi</a>
            </div>
          </div>
        )}

        {panel === "Roller" && (
          <div className="eg-panel tier-panel">
            <div className="panel-intro">
              <div>
                <small>HARF NOTU YERİNE ROL MATRİSİ</small>
                <h3>Önce ölç, sonra tier list yayınla.</h3>
              </div>
              <p>
                S/A/B notları savaş kaydı olmadan kesinlik taklidi yapar. Bu
                nedenle roller şimdilik test önceliğine göre gruplandı.
              </p>
            </div>
            <div className="role-stack">
              {roleRows.map((row) => (
                <article className={row.tone} key={row.label}>
                  <strong>{row.label}</strong>
                  <div>{row.items.map((item) => <span key={item}>{item}</span>)}</div>
                  <p>{row.why}</p>
                </article>
              ))}
            </div>
            <div className="metric-grid">
              {["Tamamlama oranı", "Ortalama süre", "Ölüm / düşme", "Rol dolma süresi", "Build dağılımı"].map(
                (metric) => <span key={metric}>{metric}</span>,
              )}
            </div>
            <div className="tier-warning">
              <b>Yayın şartı:</b> En çok kullanılan build ve karşı sınıf önerileri,
              anonim gerçek kullanım verisi oluşmadan “meta” etiketi alamaz.
            </div>
          </div>
        )}

        {panel === "Premium" && (
          <div className="eg-panel qol-panel">
            <div className="anka-review">
              <div className="anka-mark">A</div>
              <div>
                <small>MEVCUT YARDIMCI · OYUNCU GÖZLEMİ</small>
                <h3>Anka doğru temel, tamamlanmamış değer.</h3>
                <p>
                  Otomatik toplama manuel tıklamayı azaltır. Ücretli değer,
                  filtreden malzeme düzenine kadar tüm farm zincirini kısaltırsa
                  oluşur.
                </p>
              </div>
              <div className="anka-verdict">
                <small>KARAR</small>
                <b>GEREKLİ QoL</b>
                <span>Tek başına paket değil</span>
              </div>
            </div>
            <div className="qol-principle">
              <b>Ödeme ilkesi</b>
              <p>
                Para daha yüksek hasar, ganimet şansı veya ayrıcalıklı maden
                noktası değil; daha az menü ve daha iyi organizasyon satmalı.
              </p>
            </div>
            <div className="premium-grid">
              {paidIdeas.map((idea, index) => (
                <article key={idea.name}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h4>{idea.name}</h4>
                  <p>{idea.rule}</p>
                  <dl>
                    <div><dt>Oyuncu değeri</dt><dd>{idea.value}</dd></div>
                    <div><dt>P2W riski</dt><dd>{idea.risk}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
            <div className="price-pilot">
              <div>
                <small>FİYAT KARARI</small>
                <h3>Rakamı tahmin etme; paketi pilotla.</h3>
              </div>
              <p>
                Önce özellikleri ayrı ayrı ölç, ardından kalıcı paket ile isteğe
                bağlı üyelik seçeneklerini oyuncuya göster. Satın alma niyeti,
                kullanım oranı ve bırakma oranı görülmeden kesin Akçe fiyatı
                önermiyoruz.
              </p>
            </div>
            <div className="benchmark-links">
              <span>Resmî model örnekleri</span>
              <a href={sourceLinks.craftBag} target="_blank" rel="noreferrer">ESO malzeme çantası</a>
              <a href={sourceLinks.armory} target="_blank" rel="noreferrer">ESO Armory</a>
              <a href={sourceLinks.accountBank} target="_blank" rel="noreferrer">WoW hesap bankası</a>
            </div>
          </div>
        )}

        {panel === "Yol haritası" && (
          <div className="eg-panel roadmap-panel">
            <div className="panel-intro">
              <div>
                <small>ÖLÇÜLEBİLİR VE GERİ ALINABİLİR</small>
                <h3>Önce sürtünmeyi azalt, sonra içerik büyüt.</h3>
              </div>
              <p>
                Her faz bağımsız yayınlanır. Bir önceki faz ölçülebilir fayda
                göstermiyorsa sonraki yatırım otomatik kabul edilmez.
              </p>
            </div>
            <div className="roadmap compact">
              <article>
                <span>0–6 HAFTA</span>
                <h4>Görünürlük</h4>
                <ul>
                  <li>Anka filtresi ve dolu çanta uyarısı</li>
                  <li>Rol bazlı grup ilanı</li>
                  <li>Eşya karşılaştırma</li>
                  <li>Anonim temel telemetri</li>
                </ul>
                <b>P0</b>
              </article>
              <article>
                <span>2–4 AY</span>
                <h4>Lojistik</h4>
                <ul>
                  <li>Malzeme çantası pilotu</li>
                  <li>Teçhizat sayfaları</li>
                  <li>Fiyat geçmişi</li>
                  <li>Bağlantı sonrası geri dönüş</li>
                </ul>
                <b>P1</b>
              </article>
              <article>
                <span>4–8 AY</span>
                <h4>Endgame deneyi</h4>
                <ul>
                  <li>Tek bölgede haftalık mutasyon</li>
                  <li>Garanti ilerleme jetonu</li>
                  <li>Lonca seferi prototipi</li>
                  <li>Kozmetik takım rekorları</li>
                </ul>
                <b>P2</b>
              </article>
            </div>
            <div className="success-metrics">
              <div><small>BAŞARI KAPISI</small><h4>Beş metrik iyileşmeden büyütme.</h4></div>
              <ul>
                <li><b>Grup süresi</b><span>İlan → giriş</span></li>
                <li><b>Tekrar oynama</b><span>Haftalık dönüş</span></li>
                <li><b>Build çeşitliliği</b><span>Kullanılan rol</span></li>
                <li><b>Pazar sağlığı</b><span>Fiyat + işlem adedi</span></li>
                <li><b>Oyuncu dönüşü</b><span>7 / 30 gün</span></li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
