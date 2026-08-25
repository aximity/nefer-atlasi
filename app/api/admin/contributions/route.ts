import { getContributionAdmin } from "../../../../lib/contribution-admin.server";
import { listAdminContributions } from "../../../../lib/contribution-moderation.server";

export const runtime = "edge";

const responseHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(request: Request) {
  const admin = await getContributionAdmin();
  if (!admin) {
    return Response.json(
      { error: "Bu işlem için editör yetkisi gerekiyor." },
      { status: 403, headers: responseHeaders },
    );
  }
  try {
    const url = new URL(request.url);
    const result = await listAdminContributions({
      filter: url.searchParams.get("filter") ?? "queued",
      kind: url.searchParams.get("kind") ?? "all",
      query: url.searchParams.get("query") ?? "",
    });
    return Response.json(result, { headers: responseHeaders });
  } catch {
    return Response.json(
      { error: "İnceleme kuyruğu şu anda yüklenemiyor." },
      { status: 503, headers: responseHeaders },
    );
  }
}
