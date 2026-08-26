import assert from "node:assert/strict";
import test from "node:test";

test("Nefer Atlası kabuğunu ve varsayılan donanım modülünü oluşturur", async () => {
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
  assert.match(html, /M2 · DONANIM PLANLAYICI/);
  for (const slot of ["Gözlük", "Ceket", "Eldiven", "Pantolon", "Ayakkabı", "Yüzük", "Kolye", "Silah"]) {
    assert.match(html, new RegExp(slot));
  }
  assert.match(html, /KÖ BİLGİ · STRATEJİ · EKONOMİ PLATFORMU/);
  assert.match(html, /Sekiz yuvayı sen doldur/);
  assert.match(html, /Çelişkili özellikler hesap dışı/);
  assert.doesNotMatch(html, /DOĞRULANMIŞ GÖRSEL YOK/);
  assert.match(html, /M2\.5 Buz Şarjlı-\(Mor\)/);
  assert.match(html, /Nucleus Yüzük/);
  assert.match(html, /Alternatör Kolye/);
  assert.match(html, /Kıyamet Ceket/);
  for (const tab of ["Build", "Tılsım", "Bölgeler", "Görevler", "Eşyalar", "Atlas", "Endgame", "Maden", "Yetenek", "Sorunlar", "Gelişim", "Katkı"]) {
    assert.match(html, new RegExp(`<span>${tab}</span>`));
  }
  assert.doesNotMatch(html, /M3 · TILSIM VE YETENEK HESAPLAYICI/);
  assert.match(html, /129<\/strong><span>kaynaklı eşya kaydı/);
  assert.match(html, /BETA(?:<!-- -->)? v(?:<!-- -->)?0\.30\.0/);
  assert.doesNotMatch(html, /raw_game_value/);
  assert.match(html, /href="\/rehber"/);
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
  assert.match(html, /BETA(?:<!-- -->)? v(?:<!-- -->)?0\.30\.0/);
  assert.match(html, /NEDEN KULLANMALIYIM\?/);
  assert.match(html, /Bir eşyanın gerçek bilgisini arıyorum/);
  assert.match(html, /Çapraz doğrulandı/);
  assert.match(html, /BAĞLANTIYLA ERİŞİM/);
  assert.match(html, /Bağlantıya sahip herkes atlası görüntüleyebilir/);
  assert.match(html, /Genel erişim, yönetim yetkisi vermez/);
  assert.match(html, /GÜNCEL SUNUCU PORTALI/);
  assert.match(html, /https:\/\/kiyametoyun\.net\/siralama/);
  assert.match(html, /Giriş gerektiren mağaza ve hesap alanları/);
  for (const moduleName of ["Build", "Tılsım", "Bölgeler", "Görevler", "Eşyalar", "Atlas", "Endgame", "Maden", "Yetenek", "Sorunlar", "Gelişim", "Katkı"]) {
    assert.match(html, new RegExp(`>${moduleName}<`));
  }
});
