import { sha256Hex } from "../../../../lib/contribution-core.mjs";
import { GuildLogisticsValidationError, validateGuildManagement } from "../../../../lib/guild-logistics-core.mjs";
import { addGuildBooster, addGuildExpense, addGuildGoal, closeGuildBoard, findManagedGuildBoard, getGuildBoardByCode, setGuildBoosterStatus } from "../../../../lib/guild-logistics-repository.server";

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
  if (message.includes("D1 binding") || message.includes("no such table")) return json({ error: "Lonca yönetim servisi hazırlanıyor." }, 503);
  return json({ error: "Yönetim işlemi tamamlanamadı." }, 500);
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Bu gönderim kaynağına izin verilmiyor." }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return json({ error: "Yalnız JSON veri kabul edilir." }, 415);
  try {
    const validated = validateGuildManagement(await request.json());
    const managed = await findManagedGuildBoard(validated.code, await sha256Hex(validated.managerToken));
    if (!managed) return json({ error: "Yönetim anahtarı bu plana ait değil." }, 403);
    if (managed.status !== "active" && validated.action !== "close-board") return json({ error: "Kapalı plan değiştirilemez." }, 409);
    if (validated.action === "add-goal") {
      if (!await addGuildGoal(managed.id, validated.goal)) return json({ error: "Bir planda en fazla 12 hedef olabilir." }, 409);
    } else if (validated.action === "add-expense") await addGuildExpense(managed.id, validated);
    else if (validated.action === "add-booster") await addGuildBooster(managed.id, validated);
    else if (validated.action === "set-booster-status") {
      if (!await setGuildBoosterStatus(managed.id, validated.boosterId, validated.status)) return json({ error: "Artırıcı bulunamadı." }, 404);
    } else await closeGuildBoard(managed.id);
    return json({ board: await getGuildBoardByCode(validated.code), message: validated.action === "close-board" ? "Haftalık plan kapatıldı." : "Lonca masası güncellendi." });
  } catch (error) { return errorResponse(error); }
}
