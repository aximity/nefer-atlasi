import { getContributionAdmin } from "../../../../lib/contribution-admin.server";
import { CONTRIBUTION_LIMITS, sniffEvidenceFile } from "../../../../lib/contribution-core.mjs";
import { createFarmRoute, listFarmRoutes, setFarmRouteStatus } from "../../../../lib/farm-route-repository.server";

export const runtime = "edge";
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin) return true;
  if (!host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

function validId(value: unknown) {
  return typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value) ? value : "";
}

export async function GET() {
  const admin = await getContributionAdmin();
  if (!admin) return Response.json({ error: "Rota masası için yetki gerekiyor." }, { status: 403, headers });
  try {
    return Response.json({ routes: await listFarmRoutes(admin.email) }, { headers });
  } catch {
    return Response.json({ error: "Rota şablonları yüklenemedi." }, { status: 503, headers });
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Bu işlem kaynağına izin verilmiyor." }, { status: 403, headers });
  const admin = await getContributionAdmin();
  if (!admin) return Response.json({ error: "Rota masası için yetki gerekiyor." }, { status: 403, headers });
  try {
    const form = await request.formData();
    const payloadText = form.get("payload");
    const file = form.get("map");
    if (typeof payloadText !== "string") throw new Error("Rota verisi eksik.");
    if (!(file instanceof File) || !file.size) throw new Error("Rota için bir ekran görüntüsü ekle.");
    if (file.size > CONTRIBUTION_LIMITS.imageBytes) throw new Error("Görsel 5 MB sınırını aşıyor.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const policy = sniffEvidenceFile(bytes, file.type, "item_evidence");
    const route = await createFarmRoute(admin.email, JSON.parse(payloadText), { bytes, mimeType: policy.mimeType });
    return Response.json({ route }, { status: 201, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rota kaydedilemedi.";
    const expected = /olmalıdır|geçersiz|aralığ|işaret|ekran görüntüsü|5 MB|eksik|desteklenmiyor|eşleşmiyor/.test(message);
    return Response.json({ error: expected ? message : "Rota kaydedilemedi." }, { status: expected ? 400 : 500, headers });
  }
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Bu işlem kaynağına izin verilmiyor." }, { status: 403, headers });
  const admin = await getContributionAdmin();
  if (!admin) return Response.json({ error: "Rota masası için yetki gerekiyor." }, { status: 403, headers });
  try {
    const body = (await request.json()) as { id?: string; status?: string };
    const id = validId(body.id);
    if (!id || !["active", "archived"].includes(body.status ?? "")) {
      return Response.json({ error: "Geçersiz rota işlemi." }, { status: 400, headers });
    }
    const result = await setFarmRouteStatus(admin.email, id, body.status as "active" | "archived");
    if (!result) return Response.json({ error: "Rota bulunamadı." }, { status: 404, headers });
    return Response.json(result, { headers });
  } catch {
    return Response.json({ error: "Rota güncellenemedi." }, { status: 500, headers });
  }
}
