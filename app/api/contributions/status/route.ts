import {
  normalizeReceiptToken,
  sha256Hex,
} from "../../../../lib/contribution-core.mjs";
import { getContributionStatus } from "../../../../lib/contribution-repository.server";

export const runtime = "edge";

export async function GET(request: Request) {
  const code = normalizeReceiptToken(new URL(request.url).searchParams.get("code"));
  if (!code) {
    return Response.json(
      { error: "Geçerli bir Nefer Atlası katkı numarası gir." },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
  try {
    const result = await getContributionStatus(await sha256Hex(code));
    if (!result) {
      return Response.json(
        { error: "Bu numarayla eşleşen katkı bulunamadı." },
        {
          status: 404,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }
    return Response.json(result, {
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json(
      { error: "Katkı durumu şu anda sorgulanamıyor." },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
