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
const talismanProduction = read("talisman-production.json");
const enchants = read("enchants.json");
const enchantSeries = read("enchant-series.json");
const abilities = read("abilities.json");
const abilityDetails = read("ability-details.json");
const abilityVariants = read("ability-variants.json");
const abilityMedia = read("ability-media.json");
const groupLootItems = read("group-loot-items.json");
const glassesItems = read("glasses-items.json");
const glassesStats = read("glasses-stats.json");
const groupDerivedStats = read("group-derived-stats.json");
const issues = read("issues.json");
const economyLoops = read("economy-loops.json");

const publishableStatuses = new Set(["single_source", "cross_verified"]);

test("sekiz ekonomi döngüsü gerçek tüketim, para çıkışı ve güç kilidi tanımlar", () => {
  assert.equal(economyLoops.length, 8);
  assert.equal(new Set(economyLoops.map((loop) => loop.id)).size, economyLoops.length);
  const sourceIds = new Set(sources.map((source) => source.id));
  assert.ok(economyLoops.filter((loop) => loop.priority === "İlk pilot").length >= 3);
  assert.ok(economyLoops.filter((loop) => loop.powerImpact === "Savaş gücü yok").length >= 7);
  for (const loop of economyLoops) {
    assert.ok(loop.inputs.length >= 2);
    assert.ok(loop.output && loop.coinSink && loop.pilot && loop.metric);
    assert.ok(loop.guardrails.length >= 3);
    assert.ok(loop.sourceIds.every((sourceId) => sourceIds.has(sourceId)));
  }
});

test("on iki oyuncu sorunu gözlem, çıkarım, çözüm ve ölçüyle ayrıştırılır", () => {
  assert.equal(issues.length, 12);
  assert.equal(issues.filter((issue) => issue.priority === "P0").length, 2);
  assert.equal(issues.filter((issue) => issue.priority === "P1").length, 4);
  assert.equal(issues.filter((issue) => issue.priority === "P2").length, 6);
  const sourceIds = new Set(sources.map((source) => source.id));
  for (const issue of issues) {
    assert.ok(["Oyuncu bildirimi", "Anonim oyuncu gözlemi"].includes(issue.evidenceStatus));
    assert.ok(issue.observation && issue.inference && issue.quickFix && issue.midTermFix && issue.longTermFix && issue.metric);
    assert.ok(issue.reproduction.length >= 3);
    assert.ok(issue.sourceIds.every((sourceId) => sourceIds.has(sourceId)));
  }
});

test("güncel Kıyametin Öncüleri portalı canlı ve statik kaynakları ayırır", () => {
  const portalSources = sources.filter((source) => source.url.startsWith("https://kiyametoyun.net/"));
  assert.equal(portalSources.length, 4);
  assert.ok(portalSources.some((source) => source.url.endsWith("/rehber") && source.type === "community_server_guide"));
  assert.ok(portalSources.some((source) => source.url.endsWith("/haberler") && source.type === "community_server_news"));
  assert.equal(portalSources.filter((source) => source.type === "community_server_live_data").length, 2);
  assert.ok(!sources.some((source) => source.url.includes("kiyametoyun.com")));
});

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

test("tılsım üretim atlası kademe zincirini ve kaynaklı NPC kapsamını dürüstçe sınırlar", () => {
  assert.deepEqual(talismanProduction.tierRules.map((rule) => rule.tier), [1, 2, 3, "special"]);
  assert.equal(talismanProduction.tierRules.filter((rule) => rule.recipeRequired).length, 3);
  assert.equal(talismanProduction.tierRules.find((rule) => rule.tier === 1)?.materialsStatus, "awaiting_verification");
  assert.ok(talismanProduction.tierRules.filter((rule) => rule.tier !== 1).every((rule) => rule.materialsStatus === "source_matched"));
  const vendor = talismanProduction.vendors.find((row) => row.id === "gonul-buyuk-hol");
  assert.equal(vendor?.name, "Gönül");
  assert.equal(vendor?.region, "Büyük Hol");
  assert.equal(vendor?.serverScope, "normal_ikv");
  assert.deepEqual(vendor?.namedOffers, ["Büyü Bozma (I)", "Hedef Saptırma (I)"]);
  assert.ok(sources.some((source) => source.id === vendor?.sourceId && source.type === "official"));
  const report = talismanProduction.playerReports.find((row) => row.id === "ko-gonul-bilgi-tilsimlari-10m");
  assert.equal(report?.npc, "Gönül");
  assert.equal(report?.price, 10_000_000);
  assert.equal(report?.itemKind, "Hazır tılsım");
  assert.equal(report?.status, "needs_verification");
  assert.match(report?.evidenceNeeded ?? "", /oyun içi görüntü/i);
  assert.ok(talismanProduction.tierRules.every((rule) => !rule.acquisition.includes("Büyük Hol düşümü")));
  const inventoryReport = talismanProduction.playerReports.find((row) => row.id === "ko-gonul-buyu-bozma-1-ve-kondrit");
  assert.match(inventoryReport?.claim ?? "", /Büyü Bozma \(I\).*Kondrit/);
  assert.match(inventoryReport?.claim ?? "", /Safran.*Jade\/Jadeit/);
  assert.equal(inventoryReport?.status, "needs_verification");
  assert.equal(inventoryReport?.price, null);
});

test("efsun sözlüğü kaynaklı, pozitif ve birimli kayıtlardan oluşur",()=>{assert.ok(enchants.length>=35);for(const enchant of enchants){assert.ok(enchant.name&&enchant.attribute);assert.ok(enchant.value>0);assert.ok(enchant.unit);assert.ok(sources.some(source=>source.id===enchant.sourceId))}});

test("özellik birimleri kullanıcıya açık Türkçe veri sözlüğü kullanır", () => {
  for (const row of [...stats, ...enchants, ...groupDerivedStats]) {
    assert.notEqual(row.unit, "raw_game_value");
    assert.equal(row.unit, "puan");
  }
  for (const series of enchantSeries) assert.equal(series.unit, "puan");
});
test("efsun serileri büyü ve direnç kademelerini kapsar",()=>{assert.equal(enchantSeries.length,11);assert.ok(enchantSeries.flatMap(series=>series.entries).length>=128);for(const series of enchantSeries)assert.ok(series.entries.every(([name,value])=>name&&value>0))});
test("üç sınıfın 45 temel yeteneği açılma seviyeleriyle kayıtlıdır",()=>{assert.equal(abilities.length,45);for(const klass of ["Savaşçı","Büyücü","Şifacı"]){const classAbilities=abilities.filter(ability=>ability.class===klass);assert.equal(classAbilities.length,15);for(const level of [1,10,20,30,40])assert.equal(classAbilities.filter(ability=>ability.unlockLevel===level).length,3,`${klass} ${level}. seviye`)}assert.ok(!abilities.some(ability=>ability.name==="Boz Ayı"),"Boz Ayı, Kanatma varyantıdır; ayrı temel yetenek değildir")});
test("şifacının 15 temel yeteneği oyun içi tooltip ve bağımsız KÖ rehberiyle doğrulanır",()=>{
  assert.equal(abilityDetails.length,44);
  const sourceById=new Map(sources.map(source=>[source.id,source]));
  const healerDetails=abilityDetails.filter(detail=>detail.abilityId.startsWith("healer-"));
  assert.equal(healerDetails.length,15);
  for(const detail of healerDetails){
    const ability=abilities.find(ability=>ability.id===detail.abilityId);
    assert.equal(ability?.class,"Şifacı");
    assert.equal(detail.status,"cross_verified");
    assert.ok(detail.progression.length>=2);
    assert.ok(detail.evidenceImage.startsWith("/evidence/healer-abilities/"));
    const groups=new Set([detail.sourceId,...detail.verificationSourceIds].map(id=>sourceById.get(id)?.independenceGroup));
    assert.ok(groups.size>=2,`${detail.abilityId} bağımsız doğrulanmadı`);
  }
  assert.deepEqual(healerDetails.map(detail=>detail.abilityId),[
    "healer-heal","healer-poison","healer-heal-knowledge","healer-revive","healer-spirit-shield",
    "healer-meditation","healer-acid","healer-dispel","healer-acid-knowledge","healer-physical-field",
    "healer-element-field","healer-wrath","healer-summon","healer-lifesaver","healer-heal-circle",
  ]);
});
test("Boz Ayı, Kanatma yuvasını doldurur ve savaşçı kapsamını 15/15 tamamlar",()=>{
  const sourceById=new Map(sources.map(source=>[source.id,source]));
  const warriorDetails=abilityDetails.filter(detail=>detail.abilityId.startsWith("warrior-"));
  assert.deepEqual(warriorDetails.map(detail=>detail.abilityId),[
    "warrior-sprint","warrior-offensive","warrior-hard-hit","warrior-taunt","warrior-defensive",
    "warrior-distract","warrior-stop","warrior-avoid","warrior-shout","warrior-focus",
    "warrior-steadfast","warrior-sweep","warrior-redirect","warrior-heavy-hit",
  ]);
  for(const detail of warriorDetails){
    assert.equal(detail.status,"cross_verified");
    assert.ok(detail.evidenceImage.startsWith("/evidence/warrior-abilities/"));
    const groups=new Set([detail.sourceId,...detail.verificationSourceIds].map(id=>sourceById.get(id)?.independenceGroup));
    assert.ok(groups.size>=2,`${detail.abilityId} bağımsız doğrulanmadı`);
  }
  const bear=abilityVariants.find(variant=>variant.id==="warrior-bear-variant");
  assert.equal(bear.replacesAbilityId,"warrior-bleed");
  assert.equal(bear.usesSamePoints,true);
  assert.equal(bear.status,"cross_verified");
  assert.equal(bear.evidenceImage,"/evidence/warrior-abilities/boz-ayi.webp");
  assert.ok(!abilities.some(ability=>ability.name==="Boz Ayı"));
  const covered=new Set([...warriorDetails.map(detail=>detail.abilityId),bear.replacesAbilityId]);
  assert.equal(covered.size,15);
  assert.ok(covered.has("warrior-bleed"));
});
test("büyücünün on beş temel yeteneği kanıt görüntüsüne bağlanır",()=>{
  const sourceById=new Map(sources.map(source=>[source.id,source]));
  const mageDetails=abilityDetails.filter(detail=>detail.abilityId.startsWith("mage-"));
  assert.deepEqual(mageDetails.map(detail=>detail.abilityId),[
    "mage-meteor","mage-concentration","mage-physical-knowledge","mage-ice-arrow",
    "mage-resistance-break","mage-ice-knowledge","mage-fire-circle","mage-fire-knowledge","mage-meditation",
    "mage-lightning","mage-lightning-knowledge","mage-dispel","mage-tesla","mage-polar-wind","mage-mind-attack",
  ]);
  assert.equal(mageDetails.length,15);
  for(const detail of mageDetails){
    assert.equal(detail.status,"cross_verified");
    assert.ok(detail.evidenceImage.startsWith("/evidence/mage-abilities/"));
    const groups=new Set([detail.sourceId,...detail.verificationSourceIds].map(id=>sourceById.get(id)?.independenceGroup));
    assert.ok(groups.size>=2,`${detail.abilityId} bağımsız doğrulanmadı`);
  }
});
test("medya pilotu üç sınıfta sahte dosya kullanmadan bekleme durumu açar",()=>{assert.equal(abilityMedia.length,3);assert.deepEqual(new Set(abilityMedia.map(row=>abilities.find(ability=>ability.id===row.abilityId)?.class)),new Set(["Savaşçı","Büyücü","Şifacı"]));for(const row of abilityMedia){assert.equal(row.status,"awaiting_capture");assert.equal(row.poster,null);assert.deepEqual(row.sources,[]);assert.equal(row.audio,null);assert.deepEqual(row.sourceIds,[])}});

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
