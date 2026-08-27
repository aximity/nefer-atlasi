import { recordEngagement } from "../../../../lib/analytics-repository.server";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    if (request.headers.get("dnt") === "1") return new Response(null, { status: 204 });
    const payload = await request.json() as { path?: unknown; seconds?: unknown };
    if (typeof payload.path !== "string" || payload.path.length > 220 || typeof payload.seconds !== "number" || !Number.isFinite(payload.seconds)) {
      return Response.json({ error: "Geçersiz istek." }, { status: 400 });
    }
    await recordEngagement({ path: payload.path, seconds: payload.seconds }, request);
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  } catch {
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }
}
