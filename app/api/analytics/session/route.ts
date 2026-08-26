import {
  clearLoginFailures,
  createAnalyticsSessionCookie,
  isLoginRateLimited,
  recordLoginFailure,
  verifyAnalyticsPassword,
} from "../../../../lib/analytics-auth.server";

export const runtime = "edge";

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "").slice(0, 200);
  if (await isLoginRateLimited(request.headers)) {
    return new Response(null, { status: 303, headers: { Location: "/istatistik/giris?error=limit" } });
  }
  if (!(await verifyAnalyticsPassword(password))) {
    await recordLoginFailure(request.headers);
    return new Response(null, { status: 303, headers: { Location: "/istatistik/giris?error=1" } });
  }
  await clearLoginFailures();
  return new Response(null, {
    status: 303,
    headers: { Location: "/istatistik", "Set-Cookie": await createAnalyticsSessionCookie(), "Cache-Control": "no-store" },
  });
}
