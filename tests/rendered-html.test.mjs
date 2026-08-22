import assert from "node:assert/strict";
import test from "node:test";

test("renders the verified eight-slot build experience", async () => {
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
  assert.match(html, /İKV Eşya Rehberi ve Build Oluşturucu/);
  assert.match(html, /M2 · GERÇEK BUILD EDİTÖRÜ/);
  for (const slot of ["Gözlük", "Ceket", "Eldiven", "Pantolon", "Ayakkabı", "Yüzük", "Kolye", "Silah"]) {
    assert.match(html, new RegExp(slot));
  }
  assert.match(html, /KANITLI BUILD PLANLAMA MOTORU/);
  assert.match(html, /Sekiz yuvayı sen kur/);
  assert.match(html, /Çelişkili özellikler hesap dışı/);
  assert.match(html, /DOĞRULANMIŞ GÖRSEL YOK/);
  assert.match(html, /M3 · TILSIM VE YETENEK MOTORU/);
  assert.match(html, /Yetenek başına en fazla 15 puan/);
  assert.match(html, /M4 · BAĞLAMSAL ÖNERİLER/);
  assert.match(html, /Çemberlitaş<!-- --> · <!-- -->Grup Bölgesi/);
});
