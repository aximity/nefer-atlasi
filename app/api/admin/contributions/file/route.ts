import { getContributionAdmin } from "../../../../../lib/contribution-admin.server";
import { getAdminFile } from "../../../../../lib/contribution-moderation.server";

export const runtime = "edge";

export async function GET(request: Request) {
  const admin = await getContributionAdmin();
  if (!admin) {
    return Response.json(
      { error: "Bu dosya için editör yetkisi gerekiyor." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }
  const fileId = new URL(request.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(fileId)) {
    return Response.json(
      { error: "Geçerli bir kanıt dosyası seç." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
  try {
    const file = await getAdminFile(fileId);
    if (!file) {
      return Response.json(
        { error: "Kanıt dosyası bulunamadı." },
        { status: 404, headers: { "Cache-Control": "no-store" } },
      );
    }
    const { env } = await import("cloudflare:workers");
    const object = await env.BUCKET.get(file.r2Key);
    if (!object) {
      return Response.json(
        { error: "Kanıt depoda bulunamadı." },
        { status: 404, headers: { "Cache-Control": "no-store" } },
      );
    }
    const safeName = file.originalName.replace(/["\r\n]/g, "-");
    return new Response(object.body, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": file.mimeType,
        "Content-Length": String(object.size),
        "Content-Disposition": 'inline; filename="' + safeName + '"',
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return Response.json(
      { error: "Kanıt dosyası açılamadı." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
