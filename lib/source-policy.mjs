export const PRIMARY_GAME_SOURCE_AUTHORITY = "primary_game_reference";

export function isPrimaryGameSource(source) {
  return Boolean(source && (source.type === "fandom" || source.authority === PRIMARY_GAME_SOURCE_AUTHORITY));
}

export function applyPrimaryGameSourcePolicy(source) {
  return isPrimaryGameSource(source) ? {
    ...source,
    authority: PRIMARY_GAME_SOURCE_AUTHORITY,
    requiresCrossVerification: false,
  } : source;
}

export function policyStatusLabel(status, linkedSources = []) {
  if (status === "single_source" && linkedSources.some(isPrimaryGameSource)) return "İKV Wiki · ana kaynak";
  return {
    draft: "Taslak",
    single_source: "Tek kaynak · teyit bekliyor",
    cross_verified: "Çapraz doğrulandı",
    conflicted: "Çelişkili",
  }[status] ?? "Bilinmeyen durum";
}
