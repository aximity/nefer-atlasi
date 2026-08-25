function pad(value) {
  return String(value).padStart(2, "0");
}

function escapeIcs(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function compactLocalDate(date, time) {
  return `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;
}

function addMinutes(date, time, durationMinutes) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day, hour, minute + durationMinutes));
  return {
    date: `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`,
    time: `${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}`,
  };
}

export function buildCalendarEvent(event) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date) || !/^\d{2}:\d{2}$/.test(event.time)) {
    throw new Error("Etkinlik için geçerli tarih ve saat gerekli.");
  }
  const end = addMinutes(event.date, event.time, Number(event.durationMinutes) || 90);
  const description = [
    `Sunucu: ${event.server}`,
    `Bölge: ${event.region}`,
    `Aranan roller: ${event.roles}`,
    "Topluluk tarafından planlanmıştır; resmî oyun etkinliği değildir.",
    event.url ? `Davet: ${event.url}` : "",
  ].filter(Boolean).join("\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nefer Atlasi//Topluluk Takvimi//TR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${escapeIcs(event.id)}@nefer-atlasi`,
    `DTSTART;TZID=Europe/Istanbul:${compactLocalDate(event.date, event.time)}`,
    `DTEND;TZID=Europe/Istanbul:${compactLocalDate(end.date, end.time)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `LOCATION:${escapeIcs(`${event.server} · ${event.region}`)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function buildEventInviteUrl(baseUrl, event) {
  const url = new URL(baseUrl);
  url.searchParams.set("module", "endgame");
  url.searchParams.set("panel", "Takvim");
  url.searchParams.set("community", "Planlayıcı");
  for (const key of ["title", "region", "date", "time", "roles"]) {
    if (event[key]) url.searchParams.set(key, event[key]);
  }
  url.hash = "endgame";
  return url.toString();
}
