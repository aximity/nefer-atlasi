export const UPDATE_SOURCE_TYPES = Object.freeze(["DISCORD_OFFICIAL_UPDATE"]);

export const CLAIM_CATEGORIES = Object.freeze([
  "ITEM", "TALISMAN", "ACQUISITION_DROP", "NPC_STORE", "GAMEPLAY_RULE",
  "BOSS_MECHANIC", "REGION_RULE", "SKILL", "STORE", "EVENT",
  "SYSTEM_FIX", "OTHER",
]);

export const PERMANENCE = Object.freeze(["PERMANENT", "TEMPORARY", "UNKNOWN"]);
export const INTAKE_STATUSES = Object.freeze([
  "INGESTED", "PARSED", "NEEDS_VERIFICATION", "VERIFIED", "CONFLICTED",
  "APPLIED", "IGNORED",
]);

const rules = [
  {test: (line) => /%20/i.test(line) && /mağaza/i.test(line) && /indirim/i.test(line), category: "STORE", permanence: "TEMPORARY", subject: "Mağaza indirimi"},
  {test: (line) => /Al Sancak/i.test(line), category: "EVENT", permanence: "TEMPORARY", subject: "Al Sancak"},
  {test: (line) => /sistem mesajı/i.test(line) && /(hata|bug|düzelt)/i.test(line), category: "SYSTEM_FIX", permanence: "UNKNOWN", subject: "Sistem mesajı düzeltmesi"},
  {test: (line) => /Gaffar/i.test(line) && /Semiha/i.test(line), category: "BOSS_MECHANIC", permanence: "PERMANENT", subject: "Gaffar ve Semiha mekaniği"},
  {test: (line) => /Antrepo/i.test(line) && /PvP/i.test(line) && /(kapalı|kapat)/i.test(line), category: "REGION_RULE", permanence: "PERMANENT", subject: "Antrepo PvP kuralı"},
  {test: (line) => /Başlangıç Paketi/i.test(line) && /\+5/i.test(line) && /yetenek/i.test(line), category: "STORE", permanence: "PERMANENT", subject: "Başlangıç Paketi"},
  {test: (line) => /Başlangıç Paketi/i.test(line) && /\+5/i.test(line) && /yetenek/i.test(line), category: "SKILL", permanence: "PERMANENT", subject: "+5 yetenek davranışı"},
  {test: (line) => /Ruh Kalkanı/i.test(line) && /Saklı Irklar/i.test(line) && /(drop|düş)/i.test(line), category: "ACQUISITION_DROP", permanence: "PERMANENT", subject: "Ruh Kalkanı edinimi"},
];

export function messageKey(message) {
  const {guild, channel, messageId} = message.provenance;
  return `${guild.id}:${channel.id}:${messageId}`;
}

export function createUpdateIntake() {
  const records = new Map();
  return {
    ingest(message) {
      if (!UPDATE_SOURCE_TYPES.includes(message.sourceType)) throw new Error("Unsupported update source type");
      const key = messageKey(message);
      if (records.has(key)) return {record: records.get(key), duplicate: true};
      const record = {...message, key, status: "INGESTED", claims: []};
      records.set(key, record);
      return {record, duplicate: false};
    },
    parse(key) {
      const record = records.get(key);
      if (!record) throw new Error("Update intake record not found");
      const lines = record.provenance.rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const claims = [];
      for (const line of lines) {
        const matches = rules.filter((rule) => rule.test(line));
        const selected = matches.length ? matches : [{category: "OTHER", permanence: "UNKNOWN", subject: "Sınıflandırılmamış güncelleme"}];
        for (const match of selected) {
          claims.push({
            id: `${key}:claim:${claims.length + 1}`,
            category: match.category,
            permanence: match.permanence,
            subject: match.subject,
            assertion: line,
            status: "NEEDS_VERIFICATION",
            sourceMessageKey: key,
          });
        }
      }
      record.claims = claims;
      record.status = "PARSED";
      return record;
    },
    get(key) { return records.get(key); },
    size() { return records.size; },
  };
}
