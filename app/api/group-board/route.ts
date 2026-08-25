import { GroupBoardValidationError, validateGroupAnnouncement } from "../../../lib/group-board-core.mjs";
import { makeReceiptToken, sha256Hex } from "../../../lib/contribution-core.mjs";
import { cancelGroupAnnouncement, createGroupAnnouncement, groupAnnouncementSubmissionCounts, listActiveGroupAnnouncements } from "../../../lib/group-board-repository.server";

export const runtime = "edge";

const json = (body: unknown, status = 200, cache = "no-store") => Response.json(body, { status, headers: { "Cache-Control": cache, "X-Content-Type-Options": "nosniff" } });

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && !["same-origin", "none"].includes(fetchSite)) return false;
  if (!origin) return true;
  if (!host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

function errorResponse(error: unknown) {
  if (error instanceof GroupBoardValidationError) return json({ error: error.message, field: error.field }, 400);
  if (error instanceof SyntaxError) return json({ error: "İlan verisi okunamadı." }, 400);
  const message = error instanceof Error ? error.message : "";
  if (message.includes("D1 binding") || message.includes("no such table")) return json({ error: "İlan panosu hazırlanıyor. Biraz sonra tekrar dene." }, 503);
  return json({ error: "İşlem tamamlanamadı." }, 500);
}

export async function GET() {
  try {
    return json({ rows: await listActiveGroupAnnouncements() }, 200, "public, max-age=20");
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Bu gönderim kaynağına izin verilmiyor." }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return json({ error: "Yalnız JSON veri kabul edilir." }, 415);
  const size = Number(request.headers.get("content-length") || 0);
  if (size > 8192) return json({ error: "İlan verisi çok büyük." }, 413);
  try {
    const validated = validateGroupAnnouncement(await request.json());
    const clientTokenHash = await sha256Hex(validated.clientToken);
    const counts = await groupAnnouncementSubmissionCounts(clientTokenHash);
    if (counts.fifteenMinutes >= 3 || counts.day >= 10) return json({ error: "Kısa sürede çok fazla ilan açıldı. Daha sonra tekrar dene." }, 429);
    const receipt = makeReceiptToken();
    const id = crypto.randomUUID();
    await createGroupAnnouncement({
      id, receiptTokenHash: await sha256Hex(receipt), clientTokenHash,
      server: validated.server, category: validated.category, region: validated.region, title: validated.title,
      roles: validated.roles, leaderAlias: validated.leaderAlias, channel: validated.channel,
      startAt: validated.startAt, expiresAt: validated.expiresAt,
    });
    return json({ id, receipt, message: "İlan yayımlandı ve süresi dolunca otomatik kapanacak." }, 201);
  } catch (error) { return errorResponse(error); }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Bu gönderim kaynağına izin verilmiyor." }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return json({ error: "Yalnız JSON veri kabul edilir." }, 415);
  try {
    const body = await request.json() as { receipt?: string };
    const receipt = String(body.receipt || "").trim().toUpperCase();
    if (!/^NA-(?:[0-9A-F]{8}-){3}[0-9A-F]{8}$/.test(receipt)) return json({ error: "Geçersiz ilan anahtarı." }, 400);
    const cancelled = await cancelGroupAnnouncement(await sha256Hex(receipt));
    return cancelled ? json({ message: "İlan kapatıldı." }) : json({ error: "Aktif ilan bulunamadı." }, 404);
  } catch (error) { return errorResponse(error); }
}
