import { listPublishedContributions } from "../../../../lib/contribution-moderation.server";

export const runtime = "edge";

export async function GET() {
  try {
    const rows = await listPublishedContributions(200);
    return Response.json(
      { rows },
      {
        headers: {
          "Cache-Control": "public, max-age=60",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch {
    return Response.json(
      { rows: [] },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }
}
