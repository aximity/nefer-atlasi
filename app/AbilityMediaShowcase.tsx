import abilityRows from "../data/abilities.json";
import mediaRows from "../data/ability-media.json";

type MediaStatus =
  | "awaiting_capture"
  | "single_source"
  | "cross_verified"
  | "conflicted";

interface AbilityMedia {
  id: string;
  abilityId: string;
  status: MediaStatus;
  poster: string | null;
  sources: { src: string; type: string }[];
  audio: { src: string; type: string } | null;
  durationSeconds: number | null;
  sourceIds: string[];
  server: string | null;
  capturedAt: string | null;
  checkedAt: string | null;
}

const statusText: Record<MediaStatus, string> = {
  awaiting_capture: "Oyun içi kayıt bekleniyor",
  single_source: "Tek kayıt · teyit bekliyor",
  cross_verified: "Çapraz doğrulandı",
  conflicted: "Kayıtlar çelişkili",
};

const classTone: Record<string, string> = {
  Savaşçı: "warrior",
  Büyücü: "mage",
  Şifacı: "healer",
};

const classMark: Record<string, string> = {
  Savaşçı: "SV",
  Büyücü: "BY",
  Şifacı: "ŞF",
};

export default function AbilityMediaShowcase() {
  const media = mediaRows as AbilityMedia[];

  return (
    <section className="ability-media" aria-labelledby="ability-media-title">
      <div className="ability-media-head">
        <div>
          <small>3 YETENEKLİK MEDYA PİLOTU</small>
          <h3 id="ability-media-title">Yalnız gerçek oyun içi kayıt.</h3>
        </div>
        <p>
          GIF yerine daha küçük WebM/MP4; ses varsa yalnız oyuncu başlatınca
          oynar. Eşleşmeyen veya yapay görüntü yayımlanmaz.
        </p>
      </div>
      <div className="ability-media-grid">
        {media.map((entry) => {
          const ability = abilityRows.find((row) => row.id === entry.abilityId);
          if (!ability) return null;
          const hasVideo = entry.sources.length > 0;
          return (
            <article
              className={`ability-media-card ${classTone[ability.class] ?? ""}`}
              key={entry.id}
            >
              <div className="ability-media-frame">
                {hasVideo ? (
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    poster={entry.poster ?? undefined}
                  >
                    {entry.sources.map((source) => (
                      <source key={source.src} src={source.src} type={source.type} />
                    ))}
                    Tarayıcın bu video biçimini desteklemiyor.
                  </video>
                ) : (
                  <div className="ability-media-placeholder">
                    <i>{classMark[ability.class]}</i>
                    <span>MEDYA YUVASI</span>
                    <b>Oyun içi kayıt bekleniyor</b>
                  </div>
                )}
                <span className={`ability-media-status ${entry.status}`}>
                  {statusText[entry.status]}
                </span>
              </div>
              <div className="ability-media-copy">
                <small>{ability.class} · {ability.unlockLevel}. seviye</small>
                <h4>{ability.name}</h4>
                <p>{ability.roles.join(" · ")}</p>
                {entry.audio && (
                  <audio className="ability-media-audio" controls preload="none">
                    <source src={entry.audio.src} type={entry.audio.type} />
                  </audio>
                )}
                <footer>
                  <span>5–10 sn · arayüz ve yetenek görünür</span>
                  <em>{entry.server ?? "Sunucu bilgisi bekleniyor"}</em>
                </footer>
              </div>
            </article>
          );
        })}
      </div>
      <p className="ability-media-rule">
        Kabul kuralı: klipte yeteneğin kullanımı ayırt edilmeli; sunucu, tarih ve
        izin bilgisi kayda bağlanmalı. İki bağımsız kayıt gelmeden “çapraz
        doğrulandı” etiketi verilmez.
      </p>
    </section>
  );
}
