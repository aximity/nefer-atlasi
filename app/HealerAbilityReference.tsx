import abilityRows from "../data/abilities.json";
import detailRows from "../data/ability-details.json";

const detailedIds = new Set(detailRows.map((row) => row.abilityId));
const waiting = abilityRows.filter(
  (row) => row.class === "Şifacı" && !detailedIds.has(row.id),
);

export default function HealerAbilityReference() {
  return (
    <section className="healerReference" aria-labelledby="healer-reference-title">
      <div className="healerReferenceHead">
        <div>
          <small>OYUN İÇİ TOOLTIP KANITI</small>
          <h3 id="healer-reference-title">Şifacı Yetenek Sözlüğü</h3>
        </div>
        <strong>{detailRows.length} / 15</strong>
        <p>
          Bu kayıtlar ekran görüntüsündeki metinden yapılandırıldı. Her kartın
          kaynak görüntüsü açılabilir; yorum ile oyun verisi birbirine karıştırılmaz.
        </p>
      </div>

      <div className="healerAbilityGrid">
        {detailRows.map((detail) => {
          const ability = abilityRows.find((row) => row.id === detail.abilityId);
          if (!ability) return null;
          return (
            <details className="healerAbilityCard" key={detail.abilityId}>
              <summary>
                <span className="healerAbilityLevel">SV. {ability.unlockLevel}</span>
                <span>
                  <b>{ability.name}</b>
                  <small>{detail.effect}</small>
                </span>
                <i aria-hidden="true">＋</i>
              </summary>
              <div className="healerAbilityBody">
                <dl>
                  <div><dt>Hedef</dt><dd>{detail.target}</dd></div>
                  <div><dt>Süre</dt><dd>{detail.duration}</dd></div>
                  <div><dt>Yenilenme</dt><dd>{detail.cooldown}</dd></div>
                </dl>
                <ul>
                  {detail.progression.map((line) => <li key={line}>{line}</li>)}
                </ul>
                <footer>
                  <span>✓ Oyun içi görüntü + KÖ rehberi</span>
                  <a href={detail.evidenceImage} target="_blank" rel="noreferrer">
                    Kaynak görüntüyü aç ↗
                  </a>
                </footer>
              </div>
            </details>
          );
        })}
      </div>

      {waiting.length > 0 ? (
        <div className="healerAbilityWaiting">
          <b>Sonraki görsel paketi</b>
          <p>{waiting.map((ability) => ability.name).join(" · ")}</p>
          <small>Bu yeteneklerin adları kayıtlı; sayısal tooltip ayrıntıları henüz yayımlanmadı.</small>
        </div>
      ) : (
        <div className="healerAbilityWaiting complete">
          <b>Şifacı sınıfı tamamlandı · 15/15</b>
          <p>Tüm temel şifacı yetenekleri oyun içi görüntü ve KÖ rehberiyle kayıtlı.</p>
          <small>Yeni bir metin farkı görülürse ilgili kartın kaynak görüntüsü üzerinden yeniden doğrulanır.</small>
        </div>
      )}
    </section>
  );
}
