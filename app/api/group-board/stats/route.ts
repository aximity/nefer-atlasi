import { listGroupAnnouncementAnalyticsRows } from "../../../../lib/group-board-repository.server";
import { summarizeGroupDemand } from "../../../../lib/group-analytics.mjs";

export const runtime = "edge";

export async function GET() {
  try {
    const rows = await listGroupAnnouncementAnalyticsRows();
    return Response.json(summarizeGroupDemand(rows), { headers: { "Cache-Control": "public, max-age=60", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return Response.json({ error: "Analiz verisi hazırlanıyor." }, { status: 503, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  }
}
