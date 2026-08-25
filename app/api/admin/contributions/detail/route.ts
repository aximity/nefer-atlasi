import { getContributionAdmin } from "../../../../../lib/contribution-admin.server";
import {
  getAdminContribution,
  moderateContribution,
  moderationActions,
  type ModerationAction,
} from "../../../../../lib/contribution-moderation.server";

export const runtime = "edge";

const responseHeaders = {
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
    return Response.json(
      { error: "Bu işlem için editör yetkisi gerekiyor." },
      { status: 403, headers: responseHeaders },
    );
  }
  const id = validId(new URL(request.url).searchParams.get("id"));
  if (!id) {
    return Response.json(
      { error: "Geçerli bir katkı seç." },
      { status: 400, headers: responseHeaders },
    );
  }
  try {
    const result = await getAdminContribution(id);
    if (!result) {
      return Response.json(
        { error: "Katkı bulunamadı." },
        { status: 404, headers: responseHeaders },
      );
    }
    return Response.json(result, { headers: responseHeaders });
  } catch {
    return Response.json(
      { error: "Katkı ayrıntısı yüklenemedi." },
      { status: 503, headers: responseHeaders },
    );
  }
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) {
    return Response.json(
      { error: "Bu işlem kaynağına izin verilmiyor." },
      { status: 403, headers: responseHeaders },
    );
  }
  const admin = await getContributionAdmin();
  if (!admin) {
    return Response.json(
      { error: "Bu işlem için editör yetkisi gerekiyor." },
      { status: 403, headers: responseHeaders },
    );
  }
  const id = validId(new URL(request.url).searchParams.get("id"));
  if (!id) {
    return Response.json(
      { error: "Geçerli bir katkı seç." },
      { status: 400, headers: responseHeaders },
    );
  }
  try {
    const body = (await request.json()) as {
      action?: string;
      note?: string;
      independenceConfirmed?: boolean;
    };
    if (
      !body.action ||
      !moderationActions.includes(body.action as ModerationAction)
    ) {
      return Response.json(
        { error: "Geçersiz editör işlemi." },
        { status: 400, headers: responseHeaders },
      );
    }
    if (body.note !== undefined && typeof body.note !== "string") {
      return Response.json(
        { error: "Editör notu metin olmalıdır." },
        { status: 400, headers: responseHeaders },
      );
    }
    const result = await moderateContribution({
      id,
      action: body.action as ModerationAction,
      note: body.note ?? "",
      independenceConfirmed: body.independenceConfirmed === true,
      actorLabel: admin.displayName,
      actorEmail: admin.email,
    });
    if (!result) {
      return Response.json(
        { error: "Katkı bulunamadı." },
        { status: 404, headers: responseHeaders },
      );
    }
    return Response.json(result, { headers: responseHeaders });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "İşlem tamamlanamadı.";
    const expected =
      /gerekir|için kanıt yok|önce çapraz doğrulama|kısa bir editör notu/.test(
        message,
      );
    return Response.json(
      {
        error: expected
          ? message
          : "Editör kararı kaydedilemedi. Lütfen yeniden dene.",
      },
      { status: expected ? 400 : 500, headers: responseHeaders },
    );
  }
}
