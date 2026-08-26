export const runtime = "edge";

export async function GET() {
  const { env } = await import("cloudflare:workers");
  const client = String(env.ADSENSE_CLIENT_ID ?? "");
  const slots = {
    home_top: String(env.ADSENSE_HOME_TOP_SLOT ?? ""),
    home_inline: String(env.ADSENSE_HOME_INLINE_SLOT ?? ""),
  };
  const enabled = /^ca-pub-\d+$/.test(client) && Object.values(slots).some((value) => /^\d+$/.test(value));
  return Response.json(
    { enabled, ...(enabled ? { client, slots } : {}) },
    { headers: { "Cache-Control": "public, max-age=300", "X-Content-Type-Options": "nosniff" } },
  );
}
