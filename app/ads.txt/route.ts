export const runtime = "edge";

export async function GET() {
  const { env } = await import("cloudflare:workers");
  const publisher = String(env.ADSENSE_PUBLISHER_ID ?? "");
  if (!/^pub-\d+$/.test(publisher)) return new Response("Not configured", { status: 404 });
  return new Response(`google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
