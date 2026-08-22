import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (name) =>
  JSON.parse(
    fs.readFileSync(new URL(`../data/${name}`, import.meta.url), "utf8"),
  );

const items = read("items.json");
const stats = read("stats.json");
const recipes = read("recipes.json");
const sources = read("sources.json");
const evidence = read("evidence.json");
const talismans = read("talismans.json");

const publishableStatuses = new Set(["single_source", "cross_verified"]);

test("tam Çemberlitaş kataloğu 67 eşya ve her eşya için bir reçete içerir", () => {
  assert.equal(items.length, 67);
  assert.equal(recipes.length, items.length);
  assert.deepEqual(
    new Set(recipes.map((recipe) => recipe.itemId)),
    new Set(items.map((item) => item.id)),
  );
});

test("üç sınıfın tüm set aileleri katalogda yer alır", () => {
  assert.equal(items.filter((item) => item.class === "Savaşçı").length, 19);
  assert.equal(items.filter((item) => item.class === "Büyücü").length, 24);
  assert.equal(items.filter((item) => item.class === "Şifacı").length, 24);
  const families = new Set(items.map((item) => item.appearanceFamily));
  for (const family of ["bicak-sirti","tas-kanat","hidra-nefesi","kiyamet","sifir-kelvin","transformator","cehennem","ruh-doven","mevlana","hidroflorik","siyanur"]) assert.ok(families.has(family), `${family} eksik`);
});

test("üç sınıfın da hesaplanabilir tılsım serisi vardır", () => {
  for (const klass of ["Savaşçı", "Büyücü", "Şifacı"])
    assert.ok(talismans.some((talisman) => talisman.class === klass), `${klass} tılsımları eksik`);
});

test("yayımlanan temel eşya alanlarının tarihli ve kaynaklı kanıtı vardır", () => {
  for (const item of items) {
    for (const field of [
      "name",
      "class",
      "level",
      "slot",
      "rarity",
      "appearanceFamily",
    ]) {
      const claims = evidence.filter(
        (claim) =>
          claim.itemId === item.id &&
          claim.field === field &&
          publishableStatuses.has(claim.status),
      );

      assert.ok(claims.length > 0, `${item.id}.${field} için kanıt yok`);
      for (const claim of claims) {
        assert.ok(claim.checkedAt, `${claim.id} için doğrulama tarihi yok`);
        assert.ok(
          sources.some((source) => source.id === claim.sourceId),
          `${claim.id} için kaynak yok`,
        );
      }
    }
  }
});

test("çelişkili özellikler yayımlanabilir özellik toplamına girmez", () => {
  const conflicted = stats.filter(
    (stat) => stat.verificationStatus === "conflicted",
  );
  assert.ok(conflicted.length > 0, "beklenen çelişkili denetim örneği yok");
  assert.ok(
    conflicted.every(
      (stat) => !publishableStatuses.has(stat.verificationStatus),
    ),
  );
});

test("reçeteler pozitif miktarlı parça satırlarına ve bir kaynağa bağlıdır", () => {
  const sourceIds = new Set(sources.map((source) => source.id));

  for (const recipe of recipes) {
    assert.ok(sourceIds.has(recipe.sourceId), `${recipe.id} için kaynak yok`);
    assert.ok(recipe.lastChecked, `${recipe.id} için doğrulama tarihi yok`);
    assert.ok(recipe.materials.length > 0, `${recipe.id} için malzeme yok`);
    assert.ok(
      recipe.materials.every(
        (material) => material.name && material.quantity > 0,
      ),
      `${recipe.id} içinde geçersiz malzeme var`,
    );
  }
});

test("çapraz doğrulama iki bağımsız kaynak grubu gerektirir", () => {
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const crossVerified = evidence.filter(
    (claim) => claim.status === "cross_verified",
  );

  for (const claim of crossVerified) {
    const groups = new Set(
      evidence
        .filter(
          (peer) =>
            peer.itemId === claim.itemId &&
            peer.field === claim.field &&
            peer.status === "cross_verified",
        )
        .map((peer) => sourceById.get(peer.sourceId)?.independenceGroup),
    );
    assert.ok(groups.size >= 2, `${claim.id} bağımsız olarak doğrulanmamış`);
  }
});
