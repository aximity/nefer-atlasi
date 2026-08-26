import type { Metadata } from "next";
import Link from "next/link";
import { publishableItems } from "../../lib/catalog";
import { SITE_RELEASE } from "../../lib/site-release";
import "../guide.css";

export const metadata: Metadata = {
  title: "Kullanım Rehberi | Nefer Atlası",
  description:
    "Nefer Atlası modüllerini, bilgi güven seviyelerini, build planlayıcıyı, eşya kataloğunu, maden rehberini ve katkı sistemini kullanma rehberi.",
  openGraph: {
    title: "Nefer Atlası Kullanım Rehberi",
    description: "İKV bilgisini bulma, karşılaştırma, planlama ve doğrulama akışlarını adım adım öğren.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nefer Atlası Kullanım Rehberi",
    description: "Nefer Atlası’nı neden ve nasıl kullanacağını tek sayfada öğren.",
    images: ["/og.png"],
  },
};

const modules = [
  ["01", "Build", "Sınıf, hedef ve oyun türünü seç; sekiz ekipman yuvasını doldur, toplamları gör ve planını paylaş.", "/?module=builder#modules"],
  ["02", "Tılsım", "Sınıfına uygun tılsımı ve kademesini seç; yalnız kaynakta tanımlı etkileri hesaba kat.", "/?module=engine#modules"],
  ["03", "Bölgeler", "Sığınak, Migrat ve Çemberlitaş gibi grup bölgelerinde sınıfa göre düşen eşyaları incele.", "/?module=group-regions#modules"],
  ["04", "Eşyalar", "Sınıf ve yuva filtresiyle eşyayı bul; aynı yuvadan iki eşyayı yan yana karşılaştır.", "/?module=items#modules"],
  ["05", "Atlas", "Eşya, boss, reçete, malzeme, bölge ve pazar bağlantılarını tek zincir üzerinde izle.", "/?module=atlas#modules"],
  ["06", "Endgame", "Oyun sistemlerini, darboğazları, güçlü ve geliştirilmesi gereken alanları kaynaklarıyla değerlendir.", "/?module=endgame#modules"],
  ["07", "Maden", "Kontrol sayacı başlat; boş ve başarılı kontrollerden kişisel süre aralığını oluştur.", "/?module=mining#modules"],
  ["08", "Yetenek", "Sınıf yeteneklerini, puan sınırlarını ve görsel medya kanıtı durumunu kontrol et.", "/?module=skills#modules"],
  ["09", "Gelişim", "Sağlık puanını ve eksik bağlantı kuyruğunu aç; hangi eşya veya malzeme kanıtının önce gerektiğini gör.", "/?module=health#modules"],
  ["10", "Katkı", "Eşya, maden, pazar veya yetenek kanıtı gönder; makbuz koduyla inceleme durumunu takip et.", "/?module=contribute#modules"],
] as const;

const journeys = [
  {
    number: "01",
    title: "Bir eşyanın gerçek bilgisini arıyorum",
    steps: ["Eşyalar modülünü aç.", "Sınıf ve yuva filtresini seç.", "Kartı açıp özellik, elde edilme yeri ve kaynak durumunu oku.", "Kararsızsan aynı yuvadan ikinci eşyayı karşılaştır."],
    href: "/?module=items#modules",
    action: "Eşya kataloğunu aç",
  },
  {
    number: "02",
    title: "Karakterim için build kurmak istiyorum",
    steps: ["Sınıfını ve ana hedefini seç.", "PvE, PvP, Farm veya Grup Bölgesi bağlamını belirle.", "Sekiz yuvayı doldur; eksik ve çelişkili alan uyarılarını kontrol et.", "Bağlantıyı kopyalayarak buildi arkadaşınla paylaş."],
    href: "/?module=builder#modules",
    action: "Build planlayıcıyı aç",
  },
  {
    number: "03",
    title: "Maden veya farm verimi araştırıyorum",
    steps: ["Maden topladığında bölge, maden adı ve kontrol aralığını gir.", "Sayaç dolunca boş kontrolü veya başarılı toplamayı kaydet.", "En az iki başarılı ölçümden sonra oluşan aralığı garanti değil gözlem olarak oku.", "Fiyatın tarihine ve para birimine bak; canlı konum paylaşma."],
    href: "/?module=mining#modules",
    action: "Maden rehberini aç",
  },
  {
    number: "04",
    title: "Eksik veya yanlış bilgiyi düzeltmek istiyorum",
    steps: ["Katkı türünü seç.", "Gözlem tarihini ve sunucuyu yaz.", "Ekran görüntüsü veya kaynak bağlantısını ekle.", "Gönderim makbuzunu sakla; bilgi doğrudan yayımlanmaz, önce incelenir."],
    href: "/?module=contribute#modules",
    action: "Katkı merkezini aç",
  },
];

const portalSources = [
  {
    label: "SUNUCU REHBERİ",
    title: "Sınıflar, bölgeler ve sistemler",
    description: "Kıyametin Öncüleri sunucusuna özgü mekanikleri kontrol etmek için tek kaynak olarak kullanılır; resmî İKV kaynağı sayılmaz.",
    href: "https://kiyametoyun.net/rehber",
    action: "Rehberi aç",
  },
  {
    label: "GÜNCELLEME AKIŞI",
    title: "Haberler ve değişiklik notları",
    description: "Yeni etkinlik, yama ve sunucu değişikliklerini izlemek için kullanılabilir; tarihli iddialar gerektiğinde ikinci kanıt bekler.",
    href: "https://kiyametoyun.net/haberler",
    action: "Haberleri aç",
  },
  {
    label: "CANLI VERİ",
    title: "Oyuncu sıralaması",
    description: "Sınıf, seviye ve sıralama görünümü değişkendir. Statik kataloğa kopyalanmaz; güncel sonuç doğrudan portalda açılır.",
    href: "https://kiyametoyun.net/siralama",
    action: "Sıralamayı aç",
  },
  {
    label: "CANLI VERİ",
    title: "Lonca sıralaması",
    description: "Lonca puanı ve sırası canlı kaynaktan okunur. Nefer Atlası bu veriyi kalıcı gerçek gibi saklamaz.",
    href: "https://kiyametoyun.net/lonca",
    action: "Loncaları aç",
  },
] as const;

export default function GuidePage() {
  return (
    <main className="guidePage">
      <header className="guideTop">
        <Link className="guideBrand" href="/">
          <b>N</b><span><strong>NEFER ATLASI</strong><small>KULLANIM REHBERİ</small></span>
        </Link>
        <nav><a href="https://kiyametoyun.net/" target="_blank" rel="noreferrer">Oyuna git ↗</a><Link href="/">Ana site</Link><i>{SITE_RELEASE.channel} v{SITE_RELEASE.version}</i></nav>
      </header>

      <section className="guideHero">
        <div>
          <p>{SITE_RELEASE.milestone} · BAŞLANGIÇ NOKTASI</p>
          <h1>Bilgiyi bul.<br/><em>Güvenini ölç.</em></h1>
          <span>Nefer Atlası; İKV’de eşya, build, yetenek, bölge, maden ve ekonomi bilgisini aynı kaynak zincirinde toplamak için var.</span>
          <div><Link href="#baslangic">Hızlı başlangıç</Link><Link href="#guven">Güven etiketleri</Link></div>
        </div>
        <aside>
          <small>ŞU ANKİ SÜRÜM</small>
          <strong>v{SITE_RELEASE.version}</strong>
          <b>{SITE_RELEASE.channel} · {SITE_RELEASE.title}</b>
          <span>{SITE_RELEASE.releasedAt}</span>
        </aside>
      </section>

      <section className="guideWhy" id="baslangic">
        <header><p>NEDEN KULLANMALIYIM?</p><h2>Dağınık bilgiden<br/><em>karar verilebilir veriye.</em></h2></header>
        <div>
          <article><i>01</i><b>Kaynağı görünür</b><span>Bilginin nereden geldiğini ve ne zaman kontrol edildiğini saklamaz.</span></article>
          <article><i>02</i><b>Tahmini ayırır</b><span>Doğrulanmış bilgi, tek kaynak, çelişki ve eksik veri aynı şeymiş gibi gösterilmez.</span></article>
          <article><i>03</i><b>Karar kurdurur</b><span>Yalnız liste sunmaz; eşya karşılaştırır, build toplar ve farm sonuçlarını ölçer.</span></article>
          <article><i>04</i><b>Toplulukla büyür</b><span>Yeni kanıtlar inceleme kuyruğundan geçer; kaynak olmadan kesin bilgiye dönüşmez.</span></article>
        </div>
      </section>

      <section className="guideJourneys">
        <header><p>NE YAPMAK İSTİYORSUN?</p><h2>Dört hızlı kullanım akışı</h2></header>
        <div>{journeys.map((journey)=><article key={journey.number}><small>{journey.number}</small><h3>{journey.title}</h3><ol>{journey.steps.map((step)=><li key={step}>{step}</li>)}</ol><Link href={journey.href}>{journey.action} <span>↗</span></Link></article>)}</div>
      </section>

      <section className="guideTrust" id="guven">
        <div><p>BİLGİYİ NASIL OKUMALIYIM?</p><h2>Her etiket aynı güveni taşımaz.</h2><span>Renk tek başına yeterli değildir; kart üzerindeki kaynak ve kontrol tarihini de aç.</span></div>
        <div className="trustRows">
          <article className="draft"><i>1</i><span><b>Taslak</b><small>Henüz yayımlanabilir bilgi değildir; inceleme veya kanıt bekler.</small></span></article>
          <article className="single"><i>2</i><span><b>Tek kaynak · teyit bekliyor</b><small>Görülebilir ancak ikinci bağımsız kaynakla doğrulanmamıştır.</small></span></article>
          <article className="verified"><i>3</i><span><b>Çapraz doğrulandı</b><small>Birbirinden bağımsız en az iki kanıt aynı iddiayı destekler.</small></span></article>
          <article className="conflict"><i>!</i><span><b>Çelişkili</b><small>Kaynaklar uyuşmaz; değer hesaplamaya veya kesin sonuca katılmaz.</small></span></article>
        </div>
      </section>

      <section className="guideModules">
        <header><div><p>MODÜL HARİTASI</p><h2>On araç, tek atlas</h2></div><span>{publishableItems.length} kaynaklı eşya kaydıyla büyüyor</span></header>
        <div>{modules.map(([number,title,description,href])=><Link href={href} key={title}><small>{number}</small><span><b>{title}</b><em>{description}</em></span><i>↗</i></Link>)}</div>
      </section>

      <section className="guideAccess">
        <article><small>HERKESE AÇIK</small><h3>Ana atlas ve katkı merkezi</h3><p>Siteyi görüntülemek, build hazırlamak, eşyaları incelemek ve kanıt göndermek için ChatGPT hesabı gerekmez.</p><Link href="/">Ana siteye dön</Link></article>
        <article><small>SAHA PİLOTU / EDİTÖR</small><h3>Farm Operasyonu ve inceleme masası</h3><p>Uzun farm oturumları, kişisel verim kayıtları ve moderasyon araçları yalnız yetkilendirilmiş hesaplara açıktır.</p><span>Herkese açık sayaçlar ise giriş istemeden cihazında çalışır.</span></article>
      </section>

      <section className="guidePortal">
        <header>
          <div><p>GÜNCEL SUNUCU PORTALI</p><h2>Canlı bilgiyi doğru yerde kullan.</h2></div>
          <a href="https://kiyametoyun.net/" target="_blank" rel="noreferrer">kiyametoyun.net ↗</a>
        </header>
        <p className="guidePortalNote">Portal, kendi beyanına göre bağımsız bir özel sunucu/topluluk projesidir. Bu kaynaklar orijinal oyunun resmî yayıncısı yerine geçmez. Giriş gerektiren mağaza ve hesap alanları değerlendirme kapsamına alınmaz.</p>
        <div>{portalSources.map((source)=><article key={source.title}><small>{source.label}</small><h3>{source.title}</h3><p>{source.description}</p><a href={source.href} target="_blank" rel="noreferrer">{source.action} ↗</a></article>)}</div>
      </section>

      <section className="guideRelease">
        <header><span><small>{SITE_RELEASE.milestone} · SÜRÜM NOTLARI</small><h2>{SITE_RELEASE.channel} v{SITE_RELEASE.version}</h2></span><b>{SITE_RELEASE.releasedAt}</b></header>
        <p>{SITE_RELEASE.summary}</p>
        <ul>{SITE_RELEASE.changes.map((change)=><li key={change}>{change}</li>)}</ul>
      </section>

      <footer className="guideFooter"><span><b>NEFER ATLASI</b><small>Bağımsız İKV topluluk projesi · resmî değildir.</small></span><div><a href="https://kiyametoyun.net/" target="_blank" rel="noreferrer">Oyun portalı</a><Link href="/">Atlası aç</Link></div></footer>
    </main>
  );
}
