"use client";

import Link from "next/link";
import progressionGaps from "../data/progression-gaps.json";
import marketArchive from "../data/market-whatsapp.json";

const kozmikVideo = "https://www.youtube.com/watch?v=Ftp91qW3C_Y";
const gokTempleMapVideo = "https://www.youtube.com/watch?v=RCHUEepMjjg";
const gokmeranVideo = "https://www.youtube.com/watch?v=d7bijwOrJ5I";
const legacyUpgradeGuide = "https://www.maxigamerz.com/konu/istanbul-kiyamet-vakti-ikv-silah-yukseltme-rehberi.240296/";

const focusOrder = ["plus-basma", "kozmik-yukseltme", "donusum-tasi", "gokmeran", "gok-tapinagi-gorevleri", "malahit"];
const orderedGaps = focusOrder.map((id) => progressionGaps.find((row) => row.id === id)).filter(Boolean);
const malahitSignal = marketArchive.signals.find((row) => row.subject === "Malahit Taşı");

function contributionUrl(label: string) {
  const subject = `${label} kanıtı`;
  const comment = `${label} için oyun içi tam ekran görüntüsü: eşya/görev adı, malzeme veya koşul ve sonuç aynı kanıtta okunmalı.`;
  return `/?module=contribute&subject=${encodeURIComponent(subject)}&comment=${encodeURIComponent(comment)}#contribute`;
}

export default function UpgradeGuide() {
  return (
    <div className="eg-panel upgrade-panel">
      <div className="panel-intro">
        <div>
          <small>P0 · YÜKSELTME KARAR MERKEZİ</small>
          <h3>Önce pahalı hatayı kapat.</h3>
        </div>
        <p>
          + basma ve Kozmik Yükseltme ilk sırada. Sayı, oran veya edinme yolu;
          KÖ oyun ekranında görülmeden kesin rehbere dönüşmüyor.
        </p>
      </div>

      <div className="upgrade-focus">
        <article>
          <span>1 · AKTİF</span>
          <h4>+ basma</h4>
          <p>Kademe maliyeti, başarısızlık sonucu ve başarı kuralı aynı kanıt paketinde kapanacak.</p>
          <b>En pahalı yanlış yönlendirme riski</b>
        </article>
        <article>
          <span>2 · AKTİF</span>
          <h4>Kozmik Yükseltme</h4>
          <p>Uygun silah, dönüşüm girdileri ve işlem sonucu önce/sonra ekranıyla doğrulanacak.</p>
          <a href={kozmikVideo} target="_blank" rel="noreferrer">Güncel oyuncu kaydı ↗</a>
        </article>
        <article>
          <span>3 · BAĞIMLILIK</span>
          <h4>Dönüşüm · Malahit · Gökmeran</h4>
          <p>Bu üç kayıt, yükseltmenin girdi ve edinme zinciri olarak birlikte denetleniyor.</p>
          <Link href="/?module=mining&view=Pazar&material=Malahit%20Ta%C5%9F%C4%B1#mining">Malahit pazarını aç ↗</Link>
        </article>
      </div>

      <nav className="upgrade-sequence" aria-label="Yükseltme araştırma sırası">
        {orderedGaps.map((row) => row && (
          <a href={`#upgrade-${row.id}`} key={row.id}>
            <b>{String(row.step).padStart(2, "0")}</b>
            <span>{row.label}</span>
          </a>
        ))}
      </nav>

      <div className="upgrade-rule">
        <b>KÖ / normal İKV ayrımı</b>
        <p>
          2015 tarihli normal İKV Silah Yükseltme rehberi yalnız karşılaştırma kaynağıdır;
          Kıyametin Öncüleri için koşul, ücret veya bağlanma kanıtı sayılmaz.
        </p>
        <a href={legacyUpgradeGuide} target="_blank" rel="noreferrer">Arşiv kaynağı ↗</a>
      </div>

      <div className="upgrade-status-grid">
        {orderedGaps.map((row) => row && (
          <article key={row.id} id={`upgrade-${row.id}`} className={`upgrade-status ${row.status}`}>
            <header>
              <span>{String(row.step).padStart(2, "0")} · {row.priority}</span>
              <b>{row.statusLabel}</b>
            </header>
            <h4>{row.label}</h4>
            <p>{row.why}</p>
            <div className="upgrade-known">
              <small>ŞU AN BİLDİĞİMİZ</small>
              <p>{row.id === "malahit" && malahitSignal
                ? `${marketArchive.metadata.coverageStart.slice(8)}–${marketArchive.metadata.coverageEnd.slice(8)} Ağustos anonim ticaret arşivinde ${malahitSignal.activeDays} aktif gün, ${malahitSignal.buySignals} alım ve ${malahitSignal.sellSignals} satım sinyali var. Bu, edinme yolu veya kullanım formülü değildir.`
                : row.known}</p>
            </div>
            <div className="upgrade-observations" aria-label={`${row.label} kanıt özeti`}>
              {row.observations.map((observation) => (
                <div className={observation.level} key={`${row.id}-${observation.label}`}>
                  <small>{observation.label}</small>
                  <p>{row.id === "malahit" && observation.label === "Pazar sinyali" && malahitSignal
                    ? `${malahitSignal.activeDays} aktif gün · ${malahitSignal.buySignals} alım · ${malahitSignal.sellSignals} satım sinyali`
                    : observation.detail}</p>
                </div>
              ))}
            </div>
            <section className="upgrade-safe-actions">
              <small>ŞİMDİ GÜVENLE NE YAPILABİLİR?</small>
              <ol>{row.safeActions.map((item) => <li key={item}>{item}</li>)}</ol>
            </section>
            <details>
              <summary>Açık alanlar ve gereken kanıt</summary>
              <div className="upgrade-details">
                <section>
                  <small>DOĞRULANMAYAN</small>
                  <ul>{row.unknown.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
                <section>
                  <small>KAPATMA KANITI</small>
                  <ul>{row.evidenceNeeded.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
              </div>
            </details>
            <footer>
              {row.id === "kozmik-yukseltme" && <a href={kozmikVideo} target="_blank" rel="noreferrer">Video kaydı ↗</a>}
              {row.id === "gokmeran" && <a href={gokmeranVideo} target="_blank" rel="noreferrer">Gökmeran video kaydı ↗</a>}
              {row.id === "gok-tapinagi-gorevleri" && <a href={gokTempleMapVideo} target="_blank" rel="noreferrer">Harita videosunu aç ↗</a>}
              <Link href={contributionUrl(row.label)}>Kanıt gönder ↗</Link>
            </footer>
          </article>
        ))}
      </div>

      <div className="upgrade-capture-plan">
        <div>
          <small>TEK EKRAN YETMEZ</small>
          <h4>Bir yükseltme kaydını üç görüntü kapatır.</h4>
        </div>
        <ol>
          <li><b>01</b><span>Önce</span><p>Eşyanın adı, kademe ve efsunlar.</p></li>
          <li><b>02</b><span>Onay</span><p>Malzeme, adet, ücret ve uyarı.</p></li>
          <li><b>03</b><span>Sonuç</span><p>Başarı/başarısızlık ve yeni bilgi kutusu.</p></li>
        </ol>
      </div>
    </div>
  );
}
