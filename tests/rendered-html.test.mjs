import assert from "node:assert/strict";
import test from "node:test";

test("Nefer Atlası sade arama-öncelikli ana sayfayı oluşturur", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /Nefer Atlası \| KÖ Bilgi, Strateji ve Ekonomi Platformu/);
  assert.match(html, /Ne arıyorsun\?/);
  assert.match(html, /Önce bilgiyi seç/);
  for (const shortcut of ["Eşyalar", "Tılsım", "Reçeteler", "Görevler"]) assert.match(html, new RegExp(`>${shortcut}<`));
  assert.doesNotMatch(html, /M2 · DONANIM PLANLAYICI/);
  assert.doesNotMatch(html, /Sekiz yuvayı sen doldur/);
  assert.doesNotMatch(html, /Nucleus Yüzük/);
  assert.doesNotMatch(html, /Nefer Atlası ne yapar\?/);
  assert.match(html, /BETA(?:<!-- -->)? v(?:<!-- -->)?0\.76\.0/);
  assert.match(html, /Atlas genelinde ara/);
  assert.match(html, /Atlas’ta ara/);
  assert.doesNotMatch(html, /raw_game_value/);
  assert.match(html, /href="\/rehber"/);
  assert.match(html, /href="\/uretim"/);
  assert.match(html, /href="\/kaynaklar"/);
  assert.match(html, /Bağlantılar ve yönetim/);
  assert.match(html, /href="https:\/\/kiyametoyun\.net\/"/);
});

test("bağlantıyla erişilen rehber, kullanım akışlarını ve güven sözlüğünü gösterir", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("guide-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/rehber", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Kullanım Rehberi \| Nefer Atlası/);
  assert.match(html, /BETA(?:<!-- -->)? v(?:<!-- -->)?0\.76\.0/);
  assert.match(html, /Yetenek puanlarımı dağıtmak istiyorum/);
  assert.match(html, /NEDEN KULLANMALIYIM\?/);
  assert.match(html, /Bir eşyanın gerçek bilgisini arıyorum/);
  assert.match(html, /Çapraz doğrulandı/);
  assert.match(html, /BAĞLANTIYLA ERİŞİM/);
  assert.match(html, /Bağlantıya sahip herkes atlası görüntüleyebilir/);
  assert.match(html, /Genel erişim, yönetim yetkisi vermez/);
  assert.match(html, /GÜNCEL SUNUCU PORTALI/);
  assert.match(html, /https:\/\/kiyametoyun\.net\/siralama/);
  assert.match(html, /Giriş gerektiren mağaza ve hesap alanları/);
  assert.match(html, /On beş araç, tek atlas/);
  for (const moduleName of ["Donanım", "Tılsım", "Bölgeler", "Görevler", "Eşyalar", "Reçeteler", "Atlas", "Endgame", "Maden", "Döngü", "Yetenek", "Sorunlar", "Proje durumu", "Geri bildirim", "Sürdürülebilirlik"]) {
    assert.match(html, new RegExp(`>${moduleName}<`));
  }
});

test("herkese açık üretim takibi stok ve fotoğraf akışını oluşturur", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("production-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/uretim", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Üretim Takibi \| Nefer Atlası/);
  assert.match(html, /Çantayı okut\./);
  assert.match(html, /En yakın üretimi gör\./);
  assert.match(html, /M34 · ÜRETİM TAKİP MASASI/);
  assert.match(html, /Fotoğraf cihazında analiz edilir/);
  assert.match(html, /Otomatik analiz/);
  assert.match(html, /Sonucu onayla/);
  assert.match(html, /Galeriden seç/);
  assert.match(html, /Şimdi fotoğraf çek/);
  assert.match(html, /module=recipes/);
  assert.doesNotMatch(html, /Yönetici erişimi gerekli/);
});

test("kategori bazlı kaynak dizini İKV Wiki bağlarını ayrı sayfada gösterir", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("sources-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/kaynaklar", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Kaynaklar \| Nefer Atlası/);
  assert.match(html, /Neyi, nereden aldık\?/);
  assert.match(html, /Eşyalar ve eşya reçeteleri/);
  assert.match(html, /Tılsımlar ve tılsım reçeteleri/);
  assert.match(html, /İksirler/);
  assert.match(html, /Madenler, materyaller ve meslekler/);
  assert.match(html, /İKV Wiki/);
});

test("gizlilik ve özel istatistik girişi ChatGPT hesabı istemeden açılır", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("analytics-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
  const ctx = { waitUntil() {}, passThroughOnException() {} };
  const privacy = await worker.fetch(new Request("http://localhost/gizlilik", { headers: { accept: "text/html" } }), env, ctx);
  assert.equal(privacy.status, 200);
  const privacyHtml = await privacy.text();
  assert.match(privacyHtml, /Ham IP adresi/);
  assert.match(privacyHtml, /Reklam sistemi şu an kapalıdır/);
  const login = await worker.fetch(new Request("http://localhost/istatistik/giris", { headers: { accept: "text/html" } }), env, ctx);
  assert.equal(login.status, 200);
  const loginHtml = await login.text();
  assert.match(loginHtml, /ChatGPT hesabı gerekmez/);
  assert.match(loginHtml, /action="\/api\/analytics\/session"/);
});
