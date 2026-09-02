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
const itemUpgrades = read("item-upgrades.json");
const materialAcquisitions = read("material-acquisitions.json");
const talismanAcquisitionRules = read("talisman-acquisition-rules.json");
const gameplayRules = read("gameplay-rules.json");

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

test("REC-024 aynı-stat katkıları ayrı canonical satır ve provenance ile korunur", () => {
  const groups = new Map();
  for (const stat of stats) {
    if (!stat.contributionGroup) continue;
    groups.set(stat.contributionGroup, [...(groups.get(stat.contributionGroup) ?? []), stat]);
  }
  assert.equal(groups.size, 11);
  assert.equal(stats.filter((stat) => stat.verificationStatus === "conflicted").length, 0);
  for (const rows of groups.values()) {
    assert.equal(rows.length, 2);
    assert.deepEqual(rows.map((row) => row.contributionIndex).sort(), [1, 2]);
    assert.equal(new Set(rows.map((row) => row.attribute)).size, 1);
    assert.equal(new Set(rows.map((row) => row.unit)).size, 1);
    assert.ok(rows.every((row) => publishableStatuses.has(row.verificationStatus)));
    for (const row of rows) {
      assert.ok(row.evidenceIds.length >= 2);
      assert.ok(row.evidenceIds.every((id) => evidence.some((claim) => claim.id === id)));
    }
  }
  assert.equal(groups.get("mevlana-ceket-iyilestirme-buyuleri").every((row) => row.confidence === "medium"), true);
  assert.equal([...groups.values()].flat().filter((row) => row.confidence === "high").length, 20);
  assert.equal(stats.some((stat) => stat.id === "stat-tas-kanat-ceket-savunma"), false);
  assert.equal(stats.some((stat) => /(?:ceket|amplifikatoru?)-maksimum-kudret$/.test(stat.id) && ["kiyamet","sifir-kelvin","transformator","cehennem"].some((family) => stat.id.includes(family))), false);
  assert.equal(stats.some((stat) => stat.id === "stat-mevlana-ceket-maksimum-kudret"), false);
});

test("Mevlana Asa kullanıcı tooltipi canonical base statları ayrı provenance ile destekler", () => {
  const claims = evidence.filter((claim) => claim.sourceId === "user-mevlana-asa-tooltip-20260901");
  assert.equal(claims.length, 3);
  assert.ok(claims.every((claim) => claim.evidenceType === "USER_GAME_EVIDENCE"));
  const source = sources.find((row) => row.id === "user-mevlana-asa-tooltip-20260901");
  assert.equal(source.type, "user_game_evidence");
  assert.equal(source.artifactStored, false);
  assert.deepEqual(
    stats.filter((stat) => stat.itemId === "mevlana-asa").map((stat) => [stat.attribute, stat.value]),
    [["İyileştirme Büyüleri",383000],["İyileştirme Büyüleri",383000],["Büyü Kritik Şansı",4354],["Kudret Rejenerasyonu",75000]],
  );
});

test("Mevlana Asa yükseltmesi base contributionları değiştirmeden kaynak değerlerini eşler", () => {
  assert.equal(itemUpgrades.length, 1);
  const upgrade = itemUpgrades[0];
  assert.equal(upgrade.itemId, "mevlana-asa");
  assert.equal(upgrade.baseState, "base");
  assert.equal(upgrade.upgradedState, "upgraded");
  assert.deepEqual(upgrade.contributions.map((row) => [row.baseValue,row.upgradedValue]), [[383000,766000],[383000,766000],[4354,5000],[75000,75000]]);
  assert.ok(upgrade.contributions.every((row) => stats.some((stat) => stat.id === row.baseStatId && stat.value === row.baseValue)));
});

test("materyal edinimleri yalnız kaynaklandırılmış düşman ve meslek ilişkilerini taşır", () => {
  assert.deepEqual(materialAcquisitions.map((row) => row.id).sort(), ["acquisition-gadolinyum-monazit-madenci","acquisition-jadeit-yesim-tasi-sarraf","acquisition-orumcek-salgisi-orumcek","acquisition-peptit-klorotoksin-akrep","acquisition-safran-cigdem-lokman","acquisition-xenotim-sakli-tur"]);
  assert.ok(materialAcquisitions.every((row) => row.status === "single_source"));
  const saffron = materialAcquisitions.find((row) => row.material === "Safran");
  assert.equal(saffron.profession, "Lokman");
  assert.equal(saffron.sourceEntity, "Çiğdem");
  const jadeite = materialAcquisitions.find((row) => row.material === "Jadeit");
  assert.deepEqual([jadeite.profession,jadeite.sourceEntity,jadeite.sourceTier,jadeite.requiredProfessionPoints], ["Sarraf","Yeşim Taşı",2,45]);
  const gadolinium = materialAcquisitions.find((row) => row.material === "Gadolinyum");
  assert.deepEqual([gadolinium.profession,gadolinium.sourceEntity,gadolinium.sourceTier,gadolinium.requiredProfessionPoints], ["Madenci","Monazit",2,45]);
  assert.ok(!materialAcquisitions.some((row) => row.material === "Kondrit"));
  assert.ok(!materialAcquisitions.some((row) => row.profession === "Madenci" && row.material === "Safran"));
});

test("tılsım edinim kuralları belirsiz I. kademe kapsamından NPC veya drop listesi türetmez", () => {
  assert.deepEqual(talismanAcquisitionRules.map((row) => [row.scope,row.tiers,row.acquisitionType]), [["some",[1],"currency_purchase"],["some",[1],"enemy_drop"],["all",[2,3],"recipe_crafting"]]);
  assert.ok(talismanAcquisitionRules.every((row) => row.status === "single_source" && row.npcId === undefined && row.enemyIds === undefined));
});

test("Mavi Gazap iyileştirme kuralı resmî kaynağa bağlı ve Cankurtaran'a genellenmez", () => {
  assert.deepEqual(gameplayRules, [{id:"blue-wrath-healing-availability",subjectId:"healer-gazap-blue-special",condition:"Mavi Gazap tılsımı takılıyken Gazap kullanımı",effect:"İyileştirme yeteneğinin kullanılabilirliği",value:50,unit:"percent",sourceId:"ikv-healer-talismans",status:"single_source",lastChecked:"2026-09-01"}]);
  assert.ok(!gameplayRules.some((rule) => /Cankurtaran/i.test(rule.effect)));
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
