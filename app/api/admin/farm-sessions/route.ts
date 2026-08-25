import { getContributionAdmin } from "../../../../lib/contribution-admin.server";
import {
  createFarmSession,
  listFarmSessions,
  setFarmSessionStatus,
  submitFarmSessionForReview,
} from "../../../../lib/farm-repository.server";

export const runtime = "edge";

const responseHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin) return true;
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function validId(value: unknown) {
  return typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value) ? value : "";
}

export async function GET() {
  const admin = await getContributionAdmin();
  if (!admin) {
    return Response.json({ error: "Farm masası için yetki gerekiyor." }, { status: 403, headers: responseHeaders });
  }
  try {
    return Response.json(
      { sessions: await listFarmSessions(admin.email) },
      { headers: responseHeaders },
    );
  } catch {
    return Response.json({ error: "Farm kayıtları yüklenemedi." }, { status: 503, headers: responseHeaders });
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return Response.json({ error: "Bu işlem kaynağına izin verilmiyor." }, { status: 403, headers: responseHeaders });
  }
  const admin = await getContributionAdmin();
  if (!admin) {
    return Response.json({ error: "Farm masası için yetki gerekiyor." }, { status: 403, headers: responseHeaders });
  }
  try {
    const session = await createFarmSession(admin.email, await request.json());
    return Response.json({ session }, { status: 201, headers: responseHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Farm kaydı oluşturulamadı.";
    const expected = /olmalıdır|geçersiz|aralığ|satırı|uzunluğu/.test(message);
    return Response.json(
      { error: expected ? message : "Farm kaydı oluşturulamadı." },
      { status: expected ? 400 : 500, headers: responseHeaders },
    );
  }
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) {
    return Response.json({ error: "Bu işlem kaynağına izin verilmiyor." }, { status: 403, headers: responseHeaders });
  }
  const admin = await getContributionAdmin();
  if (!admin) {
    return Response.json({ error: "Farm masası için yetki gerekiyor." }, { status: 403, headers: responseHeaders });
  }
  try {
    const body = (await request.json()) as { id?: string; status?: string; action?: string };
    const id = validId(body.id);
    if (!id) {
      return Response.json({ error: "Geçersiz farm işlemi." }, { status: 400, headers: responseHeaders });
    }
    if (body.action === "submit_review") {
      const result = await submitFarmSessionForReview(admin.email, admin.displayName, id);
      if (!result) return Response.json({ error: "Farm kaydı bulunamadı." }, { status: 404, headers: responseHeaders });
      return Response.json(result, { headers: responseHeaders });
    }
    if (!["active", "archived"].includes(body.status ?? "")) {
      return Response.json({ error: "Geçersiz farm işlemi." }, { status: 400, headers: responseHeaders });
    }
    const result = await setFarmSessionStatus(
      admin.email,
      id,
      body.status as "active" | "archived",
    );
    if (!result) return Response.json({ error: "Farm kaydı bulunamadı." }, { status: 404, headers: responseHeaders });
    return Response.json(result, { headers: responseHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Farm kaydı güncellenemedi.";
    const expected = /zaten|arşivlenmiş|bulunamadı|çıktısı/.test(message);
    return Response.json({ error: expected ? message : "Farm kaydı güncellenemedi." }, { status: expected ? 400 : 500, headers: responseHeaders });
  }
}
