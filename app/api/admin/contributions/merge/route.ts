import { getContributionAdmin } from "../../../../../lib/contribution-admin.server";
import {
  applyCanonicalMerge,
  getCanonicalMergePreview,
  rollbackCanonicalMerge,
} from "../../../../../lib/canonical-repository.server";

export const runtime = "edge";

const headers = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

function validId(value: string | null) {
  return value && /^[0-9a-f-]{36}$/i.test(value) ? value : "";
}

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

export async function GET(request: Request) {
  const admin = await getContributionAdmin();
  if (!admin) {
    return Response.json({ error: "Editör yetkisi gerekiyor." }, { status: 403, headers });
  }
  const id = validId(new URL(request.url).searchParams.get("id"));
  if (!id) return Response.json({ error: "Geçerli bir katkı seç." }, { status: 400, headers });
  try {
    const result = await getCanonicalMergePreview(id);
    if (!result) return Response.json({ error: "Katkı bulunamadı." }, { status: 404, headers });
    return Response.json(result, { headers });
  } catch {
    return Response.json({ error: "Birleştirme önizlemesi hazırlanamadı." }, { status: 503, headers });
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return Response.json({ error: "Bu işlem kaynağına izin verilmiyor." }, { status: 403, headers });
  }
  const admin = await getContributionAdmin();
  if (!admin) {
    return Response.json({ error: "Editör yetkisi gerekiyor." }, { status: 403, headers });
  }
  const id = validId(new URL(request.url).searchParams.get("id"));
  if (!id) return Response.json({ error: "Geçerli bir katkı seç." }, { status: 400, headers });
  try {
    const body = (await request.json()) as {
      action?: string;
      expectedVersion?: number;
      confirmed?: boolean;
      note?: string;
    };
    if (!body.action || !["apply", "rollback"].includes(body.action)) {
      return Response.json({ error: "Geçersiz birleştirme işlemi." }, { status: 400, headers });
    }
    if (!Number.isInteger(body.expectedVersion) || (body.expectedVersion ?? -1) < 0) {
      return Response.json({ error: "Geçerli sürüm bilgisi eksik." }, { status: 400, headers });
    }
    if (typeof body.note !== "string" || body.note.length > 2000) {
      return Response.json({ error: "Editör notu geçersiz." }, { status: 400, headers });
    }
    const input = {
      contributionId: id,
      expectedVersion: body.expectedVersion!,
      confirmed: body.confirmed === true,
      note: body.note,
      actorLabel: admin.displayName,
      actorEmail: admin.email,
    };
    const result =
      body.action === "apply"
        ? await applyCanonicalMerge(input)
        : await rollbackCanonicalMerge(input);
    if (!result) {
      return Response.json(
        { error: "Kayıt bulunamadı." },
        { status: 404, headers },
      );
    }
    return Response.json(result, { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "İşlem tamamlanamadı.";
    const expected = /olmalıdır|yayımlanmalıdır|onaylamalısın|yeniden yükle|fark yok|notu gerekir|gerekçesi gerekir|geri alınamaz|bulunamadı/.test(message);
    return Response.json(
      { error: expected ? message : "Ana veri işlemi tamamlanamadı." },
      { status: expected ? 400 : 500, headers },
    );
  }
}
