export const COMPLETION_KIND_LABELS = {
  conflict: "Çelişkili kayıt",
  acquisition: "Elde etme bağlantısı",
  stats: "Oyun içi özellik",
  material_source: "Malzeme kaynağı",
  media: "Ortak görünüş ailesi",
  verification: "İkinci bağımsız kanıt",
};

const priorityRank = { critical: 0, high: 1, medium: 2 };

export function buildAtlasCompletionQueue({
  graph,
  images = [],
  coveredVisualFamilyIds = [],
  additionalVisualFamilies = [],
  visualFamilyForItem = (_item, node) => ({ id: `item:${node.key}`, label: node.name }),
  statsForItem = () => [],
  referenceForMaterial = () => null,
  needsVerificationForItem = (_item, node) => node.verificationStatus === "single_source",
  visualFamilyRecordCount = () => null,
}) {
  const coveredFamilies = new Set(coveredVisualFamilyIds);
  const nodeByItemId = new Map(graph.itemNodes.map((node) => [node.key, node]));
  for (const image of images) {
    if (image.nameAndAppearanceTogether !== true) continue;
    const node = nodeByItemId.get(image.itemId);
    if (node) coveredFamilies.add(visualFamilyForItem(node.item, node).id);
  }
  const records = [];
  const missingMediaFamilies = new Map();

  for (const node of graph.itemNodes) {
    const item = node.item;
    if (node.verificationStatus === "conflicted") {
      records.push(record("conflict", "critical", node, "Kaynaklar uyuşmuyor; çelişkili alan çözümlenmeden hesaplara katılmamalı."));
    }
    if (!node.recipe && !item?.acquisition && !(node.region && node.boss)) {
      records.push(record("acquisition", "high", node, "Bölge, boss, ganimet yöntemi veya reçete bağlantısı bulunmuyor."));
    }
    if (!statsForItem(node.key).length) {
      records.push(record("stats", "high", node, "Yayımlanabilir oyun içi özellik değeri bulunmuyor."));
    }
    const visualFamily = visualFamilyForItem(item, node);
    if (!coveredFamilies.has(visualFamily.id)) {
      const current = missingMediaFamilies.get(visualFamily.id);
      if (current) current.nodes.push(node);
      else missingMediaFamilies.set(visualFamily.id, { family: visualFamily, nodes: [node] });
    }
    if (needsVerificationForItem(item, node)) {
      records.push(record("verification", "medium", node, "Kayıt görünür durumda ancak ikinci bağımsız kanıt henüz yok."));
    }
  }

  for (const { family, nodes } of missingMediaFamilies.values()) {
    const first = nodes[0];
    records.push({
      id: `media:${family.id}`,
      kind: "media",
      priority: "medium",
      entityType: "item",
      entityId: first.id,
      name: family.label,
      subtitle: `${nodes.length} eşya · ortak görünüş ailesi`,
      detail: `${nodes.length} kayıt aynı gövdeyi paylaşır; aile için yalnız bir doğrulanmış oyun içi görsel bekleniyor. Efsun ve özellikler eşya kayıtlarında ayrı kalır.`,
    });
  }

  for (const family of additionalVisualFamilies) {
    if (coveredFamilies.has(family.id)) continue;
    const isTalisman = family.kind === "talisman";
    const familyRecordCount = visualFamilyRecordCount(family);
    records.push({
      id: `media:${family.id}`,
      kind: "media",
      priority: "high",
      entityType: "visual",
      entityId: family.id,
      name: family.label,
      subtitle: familyRecordCount == null
        ? (isTalisman ? "Tılsım · sınıf/renk ailesi" : "İksir · ortak renk ailesi")
        : `${familyRecordCount} ${isTalisman ? "tılsım" : "iksir"} · bu ortak görsel ailesi`,
      detail: `${family.note}${family.sizeRule ? ` ${family.sizeRule}` : ""} Aile için yalnız bir doğrulanmış oyun içi görsel bekleniyor.`,
      href: isTalisman ? "/?module=engine#modules" : "/?module=recipes&type=potion#recipes",
    });
  }

  for (const node of graph.materialNodes) {
    if (!node.source) {
      const reference = referenceForMaterial(node.name);
      records.push({
        id: `material_source:${node.key}`,
        kind: "material_source",
        priority: "high",
        entityType: "material",
        entityId: node.id,
        name: node.name,
        subtitle: `${node.uses?.length || 0} reçetede kullanılıyor`,
        detail: reference
          ? `${reference.label}: ${reference.note} Bu nedenle edinim bağlantısı açık tutuluyor.`
          : "Doğrulanmış toplayıcılık, üretim veya yaratık ganimeti kaynağı eşleşmedi; bölge ya da meslek tahmin edilmedi.",
      });
    } else if (node.source.kind === "talisman_acquisition" && node.source.verification !== "Kaynaklı kayıt") {
      records.push({
        id: `verification:${node.key}`,
        kind: "verification",
        priority: "high",
        entityType: "material",
        entityId: node.id,
        name: node.name,
        subtitle: `${node.source.npc} · ${node.source.region} · hazır I. kademe tılsım`,
        detail: node.source.evidenceNeeded,
      });
    } else if (node.source.kind === "creature_drop" && node.source.verification === "Oyuncu bilgisi" && node.source.source) {
      records.push({
        id: `verification:${node.key}`,
        kind: "verification",
        priority: "high",
        entityType: "material",
        entityId: node.id,
        name: node.name,
        subtitle: "Genel boss ganimeti · kesin boss ve bölge ayrıştırılmadı",
        detail: "Canlı topluluk kataloğu malzemeyi Boss Droplar kategorisinde gösteriyor. Boss adı ve bölge için ikinci, açık bir kanıt bekleniyor.",
      });
    }
  }

  return records.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || a.name.localeCompare(b.name, "tr"));
}

function record(kind, priority, node, detail) {
  return {
    id: `${kind}:${node.key}`,
    kind,
    priority,
    entityType: "item",
    entityId: node.id,
    name: node.name,
    subtitle: node.subtitle,
    detail,
  };
}

export function completionSummary(records) {
  const count = (kind) => records.filter((record) => record.kind === kind).length;
  return {
    total: records.length,
    critical: records.filter((record) => record.priority === "critical").length,
    conflicts: count("conflict"),
    acquisition: count("acquisition"),
    stats: count("stats"),
    materialSources: count("material_source"),
    media: count("media"),
    verification: count("verification"),
  };
}

export function filterCompletionRecords(records, { kind = "all", query = "" } = {}) {
  const wanted = String(query).trim().toLocaleLowerCase("tr-TR");
  return records.filter((record) =>
    (kind === "all" || record.kind === kind) &&
    (!wanted || `${record.name} ${record.subtitle} ${record.detail}`.toLocaleLowerCase("tr-TR").includes(wanted)),
  );
}
