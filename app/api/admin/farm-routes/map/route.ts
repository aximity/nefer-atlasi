import { getContributionAdmin } from "../../../../../lib/contribution-admin.server";
import { getFarmRouteMap } from "../../../../../lib/farm-route-repository.server";

export const runtime = "edge";

export async function GET(request: Request) {
  const admin = await getContributionAdmin();
  if (!admin) return Response.json({ error: "Bu harita için yetki gerekiyor." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: "Geçerli bir rota seç." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  try {
    const route = await getFarmRouteMap(admin.email, id);
    if (!route) return Response.json({ error: "Rota haritası bulunamadı." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    const { env } = await import("cloudflare:workers");
    const object = await env.BUCKET.get(route.r2Key);
    if (!object) return Response.json({ error: "Rota haritası depoda bulunamadı." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    return new Response(object.body, { headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": route.mimeType,
      "Content-Length": String(object.size),
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    } });
  } catch {
    return Response.json({ error: "Rota haritası açılamadı." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
