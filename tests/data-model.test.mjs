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
const enchants = read("enchants.json");
const enchantSeries = read("enchant-series.json");
const abilities = read("abilities.json");
const groupLootItems = read("group-loot-items.json");
const glassesItems = read("glasses-items.json");
const glassesStats = read("glasses-stats.json");
const groupDerivedStats = read("group-derived-stats.json");

const publishableStatuses = new Set(["single_source", "cross_verified"]);

test("67 parçalık Çemberlitaş çekirdeği korunur; doğrulanmış aksesuarlar ayrıca eklenir", () => {
  assert.equal(items.length, 68);
  assert.equal(recipes.length, 67);
  assert.deepEqual(
    new Set(recipes.map((recipe) => recipe.itemId)),
    new Set(items.filter((item) => item.id !== "alternator-kolye").map((item) => item.id)),
  );
  assert.ok(items.some((item) => item.id === "alternator-kolye" && item.slot === "Kolye"));
});

test("üç sınıf için yüzük, kolye ve hesaplanabilir gözlük verisi vardır", () => {
  assert.equal(groupLootItems.length, 50);
  assert.equal(glassesItems.length, 11);
  for (const klass of ["Savaşçı", "Büyücü", "Şifacı"]) {
    assert.ok(groupLootItems.some((item) => item.class === klass && item.slot === "Yüzük"));
    assert.ok(groupLootItems.some((item) => item.class === klass && item.slot === "Kolye"));
  }
  assert.ok(glassesStats.every((row) => row.stats.length > 0 && row.stats.every(([, value]) => value > 0)));
});

test("çift efsunlu grup yüzükleri kaynak değerinin iki katıyla hesaplanır", () => {
  assert.equal(groupDerivedStats.find((row) => row.itemId === "kutadgu-bilig-yuzuk-buyucu")?.value, 274000);
  assert.equal(groupDerivedStats.find((row) => row.itemId === "farabi-modeli-yuzuk-savasci")?.value, 478000);
  assert.equal(groupDerivedStats.find((row) => row.itemId === "ardenneler-misali-yuzuk")?.value, 17200);
  assert.ok(groupDerivedStats.every((row) => sources.some((source) => source.id === row.sourceId)));
});

test("Sığınak, Migrat ve Çemberlitaş ekipmanları üç sınıfta da kapsanır", () => {
  for (const klass of ["Savaşçı", "Büyücü", "Şifacı"]) {
    assert.ok(groupLootItems.filter((item) => item.class === klass && item.region === "Sığınaklar").length >= 7, `${klass} Sığınak eksik`);
    assert.ok(groupLootItems.filter((item) => item.class === klass && item.region === "Migrat").length >= 9, `${klass} Migrat eksik`);
    assert.ok(items.filter((item) => item.class === klass).length >= 19, `${klass} Çemberlitaş eksik`);
  }
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

test("tılsım kataloğu her sınıfta iki rengi ve tam kademeli serileri korur", () => {
  assert.equal(talismans.length, 179);
  for (const klass of ["Savaşçı", "Büyücü", "Şifacı"]) {
    const classRows = talismans.filter((talisman) => talisman.class === klass);
    assert.deepEqual([...new Set(classRows.map((talisman) => talisman.color))].sort(), ["Kırmızı", "Mavi"]);
    const series = new Map();
    for (const talisman of classRows.filter((row) => row.tier !== null)) {
      const key = `${talisman.series}|${talisman.color}`;
      series.set(key, [...(series.get(key) ?? []), talisman.tier]);
    }
    for (const tiers of series.values()) assert.deepEqual([...new Set(tiers)].sort(), [1, 2, 3]);
    assert.ok(classRows.some((talisman) => talisman.tier === null), `${klass} özel tılsımları eksik`);
  }
});

test("efsun sözlüğü kaynaklı, pozitif ve birimli kayıtlardan oluşur",()=>{assert.ok(enchants.length>=35);for(const enchant of enchants){assert.ok(enchant.name&&enchant.attribute);assert.ok(enchant.value>0);assert.ok(enchant.unit);assert.ok(sources.some(source=>source.id===enchant.sourceId))}});
test("efsun serileri büyü ve direnç kademelerini kapsar",()=>{assert.equal(enchantSeries.length,11);assert.ok(enchantSeries.flatMap(series=>series.entries).length>=128);for(const series of enchantSeries)assert.ok(series.entries.every(([name,value])=>name&&value>0))});
test("üç sınıfın 45 yeteneği açılma seviyeleriyle kayıtlıdır",()=>{assert.equal(abilities.length,45);for(const klass of ["Savaşçı","Büyücü","Şifacı"]){const classAbilities=abilities.filter(ability=>ability.class===klass);assert.equal(classAbilities.length,15);assert.deepEqual([...new Set(classAbilities.map(ability=>ability.unlockLevel))],[1,10,20,30,40])}});

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
          (publishableStatuses.has(claim.status) || (item.rarity === "Doğrulanmadı" && field === "rarity" && claim.status === "draft")),
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
