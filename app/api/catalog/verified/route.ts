import { listPublicCanonicalRecords } from "../../../../lib/canonical-repository.server";

export const runtime = "edge";

export async function GET() {
  try {
    const records = await listPublicCanonicalRecords();
    return Response.json(
      { records },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch {
    return Response.json(
      { records: [], error: "Doğrulanmış veri katmanı şu anda yüklenemiyor." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
