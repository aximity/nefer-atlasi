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
  assert.match(html, /Nefer Atlası \| İKV Bilgi, Strateji ve Ekonomi Platformu/);
  assert.match(html, /M2 · DONANIM PLANLAYICI/);
  for (const slot of ["Gözlük", "Ceket", "Eldiven", "Pantolon", "Ayakkabı", "Yüzük", "Kolye", "Silah"]) {
    assert.match(html, new RegExp(slot));
  }
  assert.match(html, /İKV BİLGİ · STRATEJİ · EKONOMİ PLATFORMU/);
  assert.match(html, /Sekiz yuvayı sen doldur/);
  assert.match(html, /Çelişkili özellikler hesap dışı/);
  assert.doesNotMatch(html, /DOĞRULANMIŞ GÖRSEL YOK/);
  assert.match(html, /M2\.5 Buz Şarjlı-\(Mor\)/);
  assert.match(html, /Nucleus Yüzük/);
  assert.match(html, /Alternatör Kolye/);
  assert.match(html, /Kıyamet Ceket/);
  for (const tab of ["Build", "Tılsım", "Bölgeler", "Eşyalar", "Endgame", "Maden", "Yetenek", "Gelişim"]) {
    assert.match(html, new RegExp(`<span>${tab}</span>`));
  }
  assert.doesNotMatch(html, /M3 · TILSIM VE YETENEK HESAPLAYICI/);
  assert.match(html, /129<\/strong><span>kaynaklı eşya kaydı/);
});
