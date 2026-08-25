import { sha256Hex } from "../../../lib/contribution-core.mjs";
import { GuildLogisticsValidationError, normalizeGuildCode, validateGuildBoard } from "../../../lib/guild-logistics-core.mjs";
import { createGuildBoard, getGuildBoardByCode, guildBoardSubmissionCount } from "../../../lib/guild-logistics-repository.server";

export const runtime = "edge";

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomText(length: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join("");
}

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
  if (error instanceof GuildLogisticsValidationError) return json({ error: error.message, field: error.field }, 400);
  if (error instanceof SyntaxError) return json({ error: "Plan verisi okunamadı." }, 400);
  const message = error instanceof Error ? error.message : "";
  if (message.includes("D1 binding") || message.includes("no such table")) return json({ error: "Lonca masası hazırlanıyor. Biraz sonra tekrar dene." }, 503);
  return json({ error: "İşlem tamamlanamadı." }, 500);
}

export async function GET(request: Request) {
  try {
    const code = normalizeGuildCode(new URL(request.url).searchParams.get("code"));
    const board = await getGuildBoardByCode(code);
    return board ? json({ board }) : json({ error: "Bu kodla bir lonca planı bulunamadı." }, 404);
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Bu gönderim kaynağına izin verilmiyor." }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return json({ error: "Yalnız JSON veri kabul edilir." }, 415);
  if (Number(request.headers.get("content-length") || 0) > 16_384) return json({ error: "Plan verisi çok büyük." }, 413);
  try {
    const validated = validateGuildBoard(await request.json());
    const clientTokenHash = await sha256Hex(validated.clientToken);
    if (await guildBoardSubmissionCount(clientTokenHash) >= 3) return json({ error: "Bir günde en fazla üç lonca planı açılabilir." }, 429);
    const id = crypto.randomUUID();
    const publicCode = `NA-LONCA-${randomText(6)}`;
    const managerToken = `NA-LM-${crypto.randomUUID().toUpperCase()}`;
    await createGuildBoard({
      id, publicCode, managerTokenHash: await sha256Hex(managerToken), clientTokenHash,
      guildName: validated.guildName, server: validated.server, weekStart: validated.weekStart,
      note: validated.note,
      goals: validated.goals.map((goal, orderIndex) => ({ id: crypto.randomUUID(), ...goal, orderIndex })),
    });
    return json({ publicCode, managerToken, board: await getGuildBoardByCode(publicCode), message: "Haftalık lonca masası açıldı." }, 201);
  } catch (error) { return errorResponse(error); }
}
