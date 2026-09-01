import {UPDATE_SOURCE_TYPES} from "./update-intake.mjs";

function requiredString(value, field) {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`Missing Discord message field: ${field}`);
  return value;
}

export function normalizeDiscordOfficialUpdate(payload, options = {}) {
  const guildId = requiredString(payload.guildId, "guildId");
  const channelId = requiredString(payload.channelId, "channelId");
  const messageId = requiredString(payload.id, "id");
  return {
    sourceType: UPDATE_SOURCE_TYPES[0],
    provenance: {
      guild: {id: guildId, name: typeof payload.guildName === "string" ? payload.guildName : null},
      channel: {id: channelId, name: typeof payload.channelName === "string" ? payload.channelName : null},
      messageId,
      publishedAt: requiredString(payload.publishedAt, "publishedAt"),
      sourceUrl: typeof payload.sourceUrl === "string" ? payload.sourceUrl : null,
      rawText: requiredString(payload.rawText, "rawText"),
      attachments: (payload.attachments ?? []).map((attachment) => ({
        id: requiredString(attachment.id, "attachment.id"),
        filename: requiredString(attachment.filename, "attachment.filename"),
        url: requiredString(attachment.url, "attachment.url"),
        contentType: typeof attachment.contentType === "string" ? attachment.contentType : null,
        size: Number.isSafeInteger(attachment.size) ? attachment.size : null,
      })),
      ingestedAt: options.ingestedAt ?? new Date().toISOString(),
    },
  };
}
