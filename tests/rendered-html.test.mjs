import assert from "node:assert/strict";
import test from "node:test";

test("Türkçeleştirilmiş sınıfa özgü donanım deneyimini oluşturur", async () => {
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
  assert.match(html, /İKV Eşya Rehberi ve Donanım Planlayıcı/);
  assert.match(html, /M2 · DONANIM PLANLAYICI/);
  for (const slot of ["Gözlük", "Ceket", "Eldiven", "Pantolon", "Ayakkabı", "Yüzük", "Kolye", "Silah"]) {
    assert.match(html, new RegExp(slot));
  }
  assert.match(html, /KANITLI DONANIM PLANLAYICI/);
  assert.match(html, /Dokuz yuvayı sen doldur/);
  assert.match(html, /Çelişkili alanlar toplama girmez/);
  assert.doesNotMatch(html, /DOĞRULANMIŞ GÖRSEL YOK/);
  assert.match(html, /M2\.5 Buz Şarjlı-\(Mor\)/);
  assert.match(html, /Nucleus Yüzük/);
  assert.match(html, /M3 · TILSIM VE YETENEK HESAPLAYICI/);
  assert.match(html, /ETKİ RAPORU/);
  assert.match(html, /YETENEK SİMÜLASYONU/);
  assert.match(html, /Alternatör Kolye/);
  assert.doesNotMatch(html, /Bu üç odak için/);
  assert.match(html, /M4 · GRUP BÖLGELERİ GANİMET ARŞİVİ/);
  assert.match(html, /Hangi boss ne atıyor\?/);
  assert.match(html, /Sığınaklar/);
  assert.match(html, /Migrat/);
  assert.match(html, /Çemberlitaş/);
  assert.match(html, /Gaffar Bey/);
  assert.match(html, /Boss düşümü veya reçeteyle üretim/);
  assert.match(html, /Bıçak Sırtı Ceket/);
  assert.match(html, /Kıyamet Ceket/);
  assert.match(html, /Ruh Döven Ceket/);
  assert.doesNotMatch(html, /EFSUN ÇÖZÜMLEYİCİ/);
  assert.doesNotMatch(html, /HAZIRLIK DENETİMİ/);
  assert.doesNotMatch(html, />[^<]*(?:Build|tank|Hibrit hedef|PvE|PvP|Farm)[^<]*</i);
  assert.match(html, /129<\/strong><span>kaynaklı eşya kaydı/);
  assert.match(html, /Amplifikatör/);
});
