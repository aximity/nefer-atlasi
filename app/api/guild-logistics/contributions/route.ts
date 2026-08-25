import { sha256Hex } from "../../../../lib/contribution-core.mjs";
import { GuildLogisticsValidationError, validateGuildContribution } from "../../../../lib/guild-logistics-core.mjs";
import { createGuildContribution, getGuildBoardByCode, guildContributionSubmissionCount, retractGuildContribution } from "../../../../lib/guild-logistics-repository.server";

export const runtime = "edge";
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin"), host = request.headers.get("host"), fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && !["same-origin", "none"].includes(fetchSite)) return false;
  if (!origin) return true;
  if (!host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

function errorResponse(error: unknown) {
  if (error instanceof GuildLogisticsValidationError) return json({ error: error.message, field: error.field }, 400);
  const message = error instanceof Error ? error.message : "";
  if (message.includes("D1 binding") || message.includes("no such table")) return json({ error: "Lonca katkı servisi hazırlanıyor." }, 503);
  return json({ error: "Katkı işlenemedi." }, 500);
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Bu gönderim kaynağına izin verilmiyor." }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return json({ error: "Yalnız JSON veri kabul edilir." }, 415);
  try {
    const validated = validateGuildContribution(await request.json());
    const board = await getGuildBoardByCode(validated.code);
    if (!board || board.status !== "active") return json({ error: "Aktif lonca planı bulunamadı." }, 404);
    const clientTokenHash = await sha256Hex(validated.clientToken);
    if (await guildContributionSubmissionCount(clientTokenHash) >= 10) return json({ error: "Kısa sürede çok fazla katkı işlendi." }, 429);
    const receipt = `NA-LK-${crypto.randomUUID().toUpperCase()}`;
    const created = await createGuildContribution({
      id: crypto.randomUUID(), boardId: board.id, goalId: validated.goalId,
      receiptTokenHash: await sha256Hex(receipt), clientTokenHash,
      contributorAlias: validated.contributorAlias, amount: validated.amount, note: validated.note,
    });
    return created ? json({ receipt, board: await getGuildBoardByCode(validated.code), message: "Katkı hedefe işlendi." }, 201) : json({ error: "Hedef bu plana ait değil veya kapalı." }, 400);
  } catch (error) { return errorResponse(error); }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Bu gönderim kaynağına izin verilmiyor." }, 403);
  try {
    const body = await request.json() as { receipt?: string };
    const receipt = String(body.receipt || "").trim().toUpperCase();
    if (!/^NA-LK-[0-9A-F-]{36}$/.test(receipt)) return json({ error: "Geçersiz katkı makbuzu." }, 400);
    return await retractGuildContribution(await sha256Hex(receipt)) ? json({ message: "Katkı geri çekildi." }) : json({ error: "Aktif katkı bulunamadı." }, 404);
  } catch (error) { return errorResponse(error); }
}
