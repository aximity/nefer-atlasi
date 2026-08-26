import { clearAnalyticsSessionCookie } from "../../../../lib/analytics-auth.server";

export const runtime = "edge";

export async function POST() {
  return new Response(null, {
    status: 303,
    headers: { Location: "/istatistik/giris", "Set-Cookie": clearAnalyticsSessionCookie(), "Cache-Control": "no-store" },
  });
}
