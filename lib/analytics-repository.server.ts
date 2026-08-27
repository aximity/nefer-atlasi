import { getRawDb } from "../db";

type PageViewInput = { path: string; referrer?: string };
type EngagementInput = { path: string; seconds: number };

function turkeyDay(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function normalizePath(value: string) {
  let parsed: URL;
  try {
    parsed = new URL(value, "https://nefer.local");
  } catch {
    return "/";
  }
  const pathname = parsed.pathname.startsWith("/") ? parsed.pathname : "/";
  const moduleName = parsed.searchParams.get("module")?.slice(0, 40);
  return `${pathname.slice(0, 120)}${moduleName ? `?module=${encodeURIComponent(moduleName)}` : ""}`;
}

function sourceFrom(input: PageViewInput, request: Request) {
  const referrer = input.referrer;
  if (!referrer) return "Doğrudan";
  try {
    const source = new URL(referrer);
    if (source.host === new URL(request.url).host) return "Site içi";
    return source.hostname.replace(/^www\./, "").slice(0, 100);
  } catch {
    return "Doğrudan";
  }
}

function deviceFrom(agent: string) {
  if (/bot|crawler|spider|preview|facebookexternalhit/i.test(agent)) return "bot";
  if (/ipad|tablet|android(?!.*mobile)/i.test(agent)) return "tablet";
  if (/mobile|iphone|ipod|android/i.test(agent)) return "mobil";
  return "masaüstü";
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function visitorHash(request: Request, day: string) {
  const { env } = await import("cloudflare:workers");
  const secret = String(env.ANALYTICS_HASH_SALT ?? "");
  if (!secret) throw new Error("Analytics hash salt is unavailable.");
  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const agent = request.headers.get("user-agent") ?? "unknown";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${day}|${ip}|${agent}`));
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function recordPageView(input: PageViewInput, request: Request) {
  const agent = request.headers.get("user-agent") ?? "";
  const device = deviceFrom(agent);
  if (device === "bot") return { accepted: false as const, reason: "bot" };
  const path = normalizePath(input.path);
  if (path.startsWith("/istatistik") || path.startsWith("/api/") || path.startsWith("/katki-inceleme")) {
    return { accepted: false as const, reason: "private" };
  }
  const day = turkeyDay();
  const source = sourceFrom(input, request);
  const hash = await visitorHash(request, day);
  const db = await getRawDb();
  const pageId = `${day}:${path}`;
  const sourceId = `${day}:${source}`;
  const visitorId = `${day}:${hash}`;
  await db.batch([
    db.prepare(`
      INSERT INTO analytics_daily_pages (id, day, path, views) VALUES (?, ?, ?, 1)
      ON CONFLICT(day, path) DO UPDATE SET views = views + 1, updated_at = CURRENT_TIMESTAMP
    `).bind(pageId, day, path),
    db.prepare(`
      INSERT INTO analytics_daily_sources (id, day, source, views) VALUES (?, ?, ?, 1)
      ON CONFLICT(day, source) DO UPDATE SET views = views + 1, updated_at = CURRENT_TIMESTAMP
    `).bind(sourceId, day, source),
    db.prepare(`
      INSERT OR IGNORE INTO analytics_daily_visitors
        (id, day, visitor_hash, device, first_path, source)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(visitorId, day, hash, device, path, source),
  ]);
  return { accepted: true as const };
}

export async function recordEngagement(input: EngagementInput, request: Request) {
  const device = deviceFrom(request.headers.get("user-agent") ?? "");
  if (device === "bot") return { accepted: false as const, reason: "bot" };
  const path = normalizePath(input.path);
  if (path.startsWith("/istatistik") || path.startsWith("/api/") || path.startsWith("/katki-inceleme")) {
    return { accepted: false as const, reason: "private" };
  }
  const seconds = Math.min(60, Math.max(1, Math.round(input.seconds)));
  const day = turkeyDay();
  const db = await getRawDb();
  await db.prepare(`
    INSERT INTO analytics_daily_engagement (id, day, path, engaged_seconds)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(day, path) DO UPDATE SET
      engaged_seconds = engaged_seconds + excluded.engaged_seconds,
      updated_at = CURRENT_TIMESTAMP
  `).bind(`${day}:${path}`, day, path, seconds).run();
  return { accepted: true as const };
}

type CountRow = { value: number };
type LabelCountRow = { label: string; value: number };
type DayCountRow = { day: string; views: number; visitors: number };
type EngagementRow = { label: string; seconds: number; views: number };

export async function getAnalyticsSummary(days = 30) {
  const safeDays = Math.min(365, Math.max(1, Math.round(days)));
  const today = turkeyDay();
  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - (safeDays - 1));
  const start = turkeyDay(startDate);
  const db = await getRawDb();
  const [views, visitors, todayViews, todayVisitors, pages, sources, devices, timeline, engagement, engagementTotal] = await Promise.all([
    db.prepare("SELECT COALESCE(SUM(views), 0) AS value FROM analytics_daily_pages WHERE day >= ?").bind(start).first<CountRow>(),
    db.prepare("SELECT COUNT(*) AS value FROM analytics_daily_visitors WHERE day >= ?").bind(start).first<CountRow>(),
    db.prepare("SELECT COALESCE(SUM(views), 0) AS value FROM analytics_daily_pages WHERE day = ?").bind(today).first<CountRow>(),
    db.prepare("SELECT COUNT(*) AS value FROM analytics_daily_visitors WHERE day = ?").bind(today).first<CountRow>(),
    db.prepare("SELECT path AS label, SUM(views) AS value FROM analytics_daily_pages WHERE day >= ? GROUP BY path ORDER BY value DESC LIMIT 10").bind(start).all<LabelCountRow>(),
    db.prepare("SELECT source AS label, SUM(views) AS value FROM analytics_daily_sources WHERE day >= ? GROUP BY source ORDER BY value DESC LIMIT 8").bind(start).all<LabelCountRow>(),
    db.prepare("SELECT device AS label, COUNT(*) AS value FROM analytics_daily_visitors WHERE day >= ? GROUP BY device ORDER BY value DESC").bind(start).all<LabelCountRow>(),
    db.prepare(`
      SELECT p.day AS day, p.views AS views, COALESCE(v.visitors, 0) AS visitors
      FROM (SELECT day, SUM(views) AS views FROM analytics_daily_pages WHERE day >= ? GROUP BY day) p
      LEFT JOIN (SELECT day, COUNT(*) AS visitors FROM analytics_daily_visitors WHERE day >= ? GROUP BY day) v ON v.day = p.day
      ORDER BY p.day ASC
    `).bind(start, start).all<DayCountRow>(),
    db.prepare(`
      SELECT e.path AS label,
             SUM(e.engaged_seconds) AS seconds,
             COALESCE(SUM(p.views), 0) AS views
      FROM analytics_daily_engagement e
      LEFT JOIN analytics_daily_pages p ON p.day = e.day AND p.path = e.path
      WHERE e.day >= ?
      GROUP BY e.path
      ORDER BY seconds DESC
      LIMIT 10
    `).bind(start).all<EngagementRow>(),
    db.prepare("SELECT COALESCE(SUM(engaged_seconds), 0) AS value FROM analytics_daily_engagement WHERE day >= ?").bind(start).first<CountRow>(),
  ]);
  const engagementRows = engagement.results.map((row) => ({
    label: String(row.label),
    seconds: Number(row.seconds),
    views: Number(row.views),
    averageSeconds: Number(row.views) > 0 ? Math.round(Number(row.seconds) / Number(row.views)) : 0,
  }));
  const totalEngagedSeconds = Number(engagementTotal?.value ?? 0);
  return {
    periodDays: safeDays,
    totalViews: Number(views?.value ?? 0),
    uniqueVisitors: Number(visitors?.value ?? 0),
    todayViews: Number(todayViews?.value ?? 0),
    todayVisitors: Number(todayVisitors?.value ?? 0),
    pages: pages.results.map((row) => ({ label: String(row.label), value: Number(row.value) })),
    sources: sources.results.map((row) => ({ label: String(row.label), value: Number(row.value) })),
    devices: devices.results.map((row) => ({ label: String(row.label), value: Number(row.value) })),
    totalEngagedSeconds,
    averageEngagedSeconds: Number(views?.value) > 0 ? Math.round(totalEngagedSeconds / Number(views?.value)) : 0,
    engagement: engagementRows,
    timeline: timeline.results.map((row) => ({ day: String(row.day), views: Number(row.views), visitors: Number(row.visitors) })),
  };
}
