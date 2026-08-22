import assert from "node:assert/strict";
import test from "node:test";

test("renders the verified class-specific build experience", async () => {
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
  assert.match(html, /Dokuz yuvayı sen kur/);
  assert.match(html, /Çelişkili özellikler hesap dışı/);
  assert.match(html, /DOĞRULANMIŞ GÖRSEL YOK/);
  assert.match(html, /M3 · TILSIM VE YETENEK MOTORU/);
  assert.match(html, /ETKİ RAPORU/);
  assert.match(html, /YETENEK SİMÜLASYONU/);
  assert.match(html, /M5 · EFSUN ÇÖZÜMLEYİCİ/);
  assert.match(html, /Alaska Modeli Bolat Modeli Kolye/);
  assert.match(html, /Alternatör Kolye/);
  assert.doesNotMatch(html, /Bu üç odak için/);
  assert.match(html, /M4 · HAZIRLIK DENETİMİ/);
  assert.match(html, /SAHA RAPORU/);
  assert.match(html, /Grup Bölgesi bu bölgeyle uyumlu/);
  assert.match(html, /68<\/strong><span>kaynaklı eşya kaydı/);
  assert.match(html, /Amplifikatör/);
});
