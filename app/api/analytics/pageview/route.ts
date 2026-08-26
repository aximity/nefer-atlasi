import { recordPageView } from "../../../../lib/analytics-repository.server";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    if (request.headers.get("dnt") === "1") return new Response(null, { status: 204 });
    const payload = await request.json() as { path?: unknown; referrer?: unknown };
    if (typeof payload.path !== "string" || payload.path.length > 220 || (payload.referrer !== undefined && typeof payload.referrer !== "string")) {
      return Response.json({ error: "Geçersiz istek." }, { status: 400 });
    }
    await recordPageView({ path: payload.path, referrer: String(payload.referrer ?? "").slice(0, 500) }, request);
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  } catch {
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }
}
