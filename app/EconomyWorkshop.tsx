"use client";

import { useMemo, useState } from "react";
import loopRows from "../data/economy-loops.json";
import { sourceFor } from "../lib/catalog";

type LoopCategory = "Çöp eşya" | "Maden" | "Karma";
type EconomyLoop = {
  id: string;
  title: string;
  shortTitle: string;
  category: LoopCategory;
  lane: string;
  priority: string;
  inputs: string[];
  output: string;
  use: string;
  coinSink: string;
  powerImpact: string;
  why: string;
  guardrails: string[];
  pilot: string;
  metric: string;
  sourceIds: string[];
};

const loops = loopRows as EconomyLoop[];
const filters = ["Tümü", "Çöp eşya", "Maden", "Karma"] as const;
const onlyDigits = (value: string) => value.replace(/\D/g, "").slice(0, 9);
const asNumber = (value: string) => Number(value || 0);
const fmt = (value: number) => new Intl.NumberFormat("tr-TR").format(value);

export default function EconomyWorkshop() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Tümü");
  const [players, setPlayers] = useState("100");
  const [weeklySpend, setWeeklySpend] = useState("250000");

  const visible = useMemo(
    () => loops.filter((loop) => filter === "Tümü" || loop.category === filter),
    [filter],
  );
  const weeklySink = asNumber(players) * asNumber(weeklySpend);
  const monthlySink = weeklySink * 4;

  return (
    <section className="economyWorkshop" id="economy">
      <div className="economyHero">
        <div>
          <p>M30 · EKONOMİ DÖNGÜ ATÖLYESİ</p>
          <h2>Çöpü girdiye,<br/><em>parayı değere dönüştür.</em></h2>
          <span>
            Bunlar mevcut oyun özelliği değil, KÖ için ölçülebilir tasarım önerileridir.
            Amaç daha çok eşya dağıtmak değil; biriken eşyayı, madeni ve oyun parasını
            düzenli biçimde sistemden çıkaran isteğe bağlı kullanım alanları kurmaktır.
          </span>
        </div>
        <aside>
          <article><small>TASARIM DÖNGÜSÜ</small><b>{loops.length}</b><span>ölçülebilir öneri</span></article>
          <article><small>GÜÇ VERMEYEN</small><b>{loops.filter((loop) => loop.powerImpact === "Savaş gücü yok").length}</b><span>kozmetik / hizmet</span></article>
          <article><small>İLK PİLOT</small><b>{loops.filter((loop) => loop.priority === "İlk pilot").length}</b><span>düşük riskli başlangıç</span></article>
        </aside>
      </div>

      <div className="economyPrinciples" aria-label="Ekonomi tasarım ilkeleri">
        <article><i>01</i><span><b>Gerçek tüketim</b><small>Eşya ve maden tarifte harcanır; başka bir oyuncuya yalnız aktarılmaz.</small></span></article>
        <article><i>02</i><span><b>Para çıkışı</b><small>Üretim, uygulama veya sözleşme için NPC hizmet bedeli alınır.</small></span></article>
        <article><i>03</i><span><b>Güç satışı yok</b><small>Kozmetik ana omurgadır; iksir mevcut güç tavanını aşamaz.</small></span></article>
        <article><i>04</i><span><b>Dönen talep</b><small>Haftalık sepet değişir; tek maden veya lonca yeni tekel kuramaz.</small></span></article>
      </div>

      <div className="economyFlow" aria-label="Önerilen üretim döngüsü">
        <span><i>1</i><b>Topla</b><small>Maden veya değersiz eşya</small></span>
        <em>→</em>
        <span><i>2</i><b>Parçala</b><small>Fiş veya ara malzeme</small></span>
        <em>→</em>
        <span><i>3</i><b>Üret</b><small>NPC bedeliyle tarif</small></span>
        <em>→</em>
        <span><i>4</i><b>Tüket</b><small>Kozmetik, iksir, sözleşme</small></span>
      </div>

      <div className="economyToolbar">
        <div role="tablist" aria-label="Ekonomi önerisi filtresi">
          {filters.map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={filter === item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
        <span>{visible.length} döngü gösteriliyor</span>
      </div>

      <div className="economyGrid">
        {visible.map((loop, index) => {
          const sources = loop.sourceIds.map(sourceFor).filter(Boolean);
          return (
            <details className={`economyCard category-${loop.category === "Maden" ? "mine" : loop.category === "Karma" ? "mixed" : "scrap"}`} key={loop.id}>
              <summary>
                <i>{String(index + 1).padStart(2, "0")}</i>
                <span><small>{loop.category} · {loop.lane}</small><b>{loop.shortTitle}</b><em>{loop.output}</em></span>
                <strong>{loop.priority}</strong>
                <u aria-hidden="true">+</u>
              </summary>
              <div className="economyCardBody">
                <section>
                  <small>GİRDİ</small>
                  <ul>{loop.inputs.map((input) => <li key={input}>{input}</li>)}</ul>
                </section>
                <section>
                  <small>ÇIKTI VE KULLANIM</small>
                  <h3>{loop.title}</h3>
                  <p>{loop.use}</p>
                  <div><b>Para çıkışı</b><span>{loop.coinSink}</span></div>
                  <div><b>Güç etkisi</b><span>{loop.powerImpact}</span></div>
                </section>
                <section>
                  <small>NEDEN İŞE YARAR?</small>
                  <p>{loop.why}</p>
                  <b className="pilotLabel">Pilot: {loop.pilot}</b>
                </section>
                <section>
                  <small>SUİSTİMAL KİLİTLERİ</small>
                  <ul>{loop.guardrails.map((rule) => <li key={rule}>{rule}</li>)}</ul>
                </section>
                <footer>
                  <span><small>BAŞARI ÖLÇÜSÜ</small><b>{loop.metric}</b></span>
                  <nav>{sources.map((source) => source && <a href={source.url} target="_blank" rel="noreferrer" key={source.id}>{source.title} ↗</a>)}</nav>
                </footer>
              </div>
            </details>
          );
        })}
      </div>

      <div className="economySimulator">
        <div>
          <p>PARA ÇIKIŞI SENARYOSU</p>
          <h3>Bir pilot ne kadar para tüketebilir?</h3>
          <span>
            Bu hesap gerçek KÖ verisi değildir. Yalnız GM ekibinin oyuncu sayısı ve makul
            harcama varsayımıyla pilot hedefi konuşmasına yardım eder.
          </span>
        </div>
        <div className="economyInputs">
          <label><span>Haftalık katılımcı</span><input inputMode="numeric" value={players} onChange={(event) => setPlayers(onlyDigits(event.target.value))} placeholder="Örn. 100" /></label>
          <label><span>Kişi başı haftalık harcama</span><input inputMode="numeric" value={weeklySpend} onChange={(event) => setWeeklySpend(onlyDigits(event.target.value))} placeholder="Örn. 250000" /></label>
        </div>
        <div className="economyResults">
          <article><small>HAFTALIK PARA ÇIKIŞI</small><b>{fmt(weeklySink)}</b><span>oyun parası</span></article>
          <article><small>DÖRT HAFTALIK PARA ÇIKIŞI</small><b>{fmt(monthlySink)}</b><span>oyun parası</span></article>
        </div>
      </div>

      <div className="economyLaunch">
        <span><small>ÖNERİLEN BAŞLANGIÇ</small><b>Hurdacı Fişi + Ham Alaşım + Boyahane</b></span>
        <p>
          Bu üçlü önce çöp eşyaya ve erken madenlere talep açar, parayı NPC hizmetleriyle
          sistemden çıkarır ve savaş gücü vermediği için en düşük denge riskiyle ölçülebilir.
          İksir ve sunucu ortak hedefi ancak ilk dört haftanın verisi görüldükten sonra eklenmelidir.
        </p>
      </div>
    </section>
  );
}
