import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
import {normalizeDiscordOfficialUpdate} from "../lib/discord-update-adapter.mjs";
import {CLAIM_CATEGORIES, INTAKE_STATUSES, PERMANENCE, createUpdateIntake} from "../lib/update-intake.mjs";

const fixture = JSON.parse(await readFile(new URL("./fixtures/discord-official-update.json", import.meta.url), "utf8"));
const normalized = () => normalizeDiscordOfficialUpdate({...fixture, author: {id: "private"}, token: "must-not-survive"}, {ingestedAt: "2026-09-01T01:00:00.000Z"});

test("intake sözleşmesi gerekli kategorileri, kalıcılığı ve durumları taşır", () => {
  for (const category of ["ITEM", "TALISMAN", "ACQUISITION_DROP", "NPC_STORE", "GAMEPLAY_RULE", "BOSS_MECHANIC", "REGION_RULE", "SKILL", "STORE", "EVENT", "SYSTEM_FIX", "OTHER"]) assert.ok(CLAIM_CATEGORIES.includes(category));
  assert.deepEqual(PERMANENCE, ["PERMANENT", "TEMPORARY", "UNKNOWN"]);
  assert.deepEqual(INTAKE_STATUSES, ["INGESTED", "PARSED", "NEEDS_VERIFICATION", "VERIFIED", "CONFLICTED", "APPLIED", "IGNORED"]);
});

test("Discord adapter kişisel ve gizli alanları normalize payload'a taşımaz", () => {
  const message = normalized();
  assert.equal(message.sourceType, "DISCORD_OFFICIAL_UPDATE");
  assert.equal(message.provenance.guild.id, "fixture-guild");
  assert.equal(message.provenance.author, undefined);
  assert.equal(message.token, undefined);
  assert.equal(message.provenance.sourceUrl, null);
});

test("guild channel messageId üçlüsü duplicate intake kaydı üretmez", () => {
  const intake = createUpdateIntake();
  assert.equal(intake.ingest(normalized()).duplicate, false);
  assert.equal(intake.ingest(normalized()).duplicate, true);
  assert.equal(intake.size(), 1);
});

test("fixture bir mesajdan beklenen bağımsız claimleri çıkarır ve review kapısında tutar", () => {
  const intake = createUpdateIntake();
  const {record} = intake.ingest(normalized());
  const parsed = intake.parse(record.key);
  assert.equal(parsed.status, "PARSED");
  assert.equal(parsed.claims.length, 8);
  const pairs = parsed.claims.map(({category, permanence}) => `${category}:${permanence}`);
  for (const pair of ["STORE:TEMPORARY", "EVENT:TEMPORARY", "SYSTEM_FIX:UNKNOWN", "BOSS_MECHANIC:PERMANENT", "REGION_RULE:PERMANENT", "STORE:PERMANENT", "SKILL:PERMANENT", "ACQUISITION_DROP:PERMANENT"]) assert.ok(pairs.includes(pair));
  assert.ok(parsed.claims.every((claim) => claim.status === "NEEDS_VERIFICATION"));
  assert.ok(parsed.claims.every((claim) => claim.status !== "APPLIED"));
});

test("intake işlemi canonical oyun veri dosyalarını değiştirmez", async () => {
  const urls = ["../data/items.json", "../data/stats.json", "../data/talismans.json"].map((path) => new URL(path, import.meta.url));
  const before = await Promise.all(urls.map((url) => readFile(url, "utf8")));
  const intake = createUpdateIntake();
  const {record} = intake.ingest(normalized());
  intake.parse(record.key);
  const after = await Promise.all(urls.map((url) => readFile(url, "utf8")));
  assert.deepEqual(after, before);
});
