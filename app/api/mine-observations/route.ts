import { getChatGPTUser } from "../../chatgpt-auth";
import contexts from "../../../data/contexts.json";
import { getD1 } from "../../../db";
import { D1MineObservationRepository } from "../../../db/mine-observation-repository.mjs";
import { gatheringRows } from "../../../lib/gathering-catalog";
import {
  listMineObservations,
  validateMineObservationWriteRequest,
  writeMineObservation,
} from "../../../lib/mine-observation-api.mjs";

export const dynamic = "force-dynamic";

const allowedRegionIds = new Set(contexts.map((context) => context.id));
const allowedResourceIds = new Set(
  gatheringRows.flatMap((source) => [source.base, source.second, source.third].filter(
    (value): value is string => Boolean(value),
  )),
);
const response = (result: { status: number; body: unknown }) => Response.json(
  result.body,
  { status: result.status, headers: { "Cache-Control": "no-store" } },
);

const repository = async () => new D1MineObservationRepository(await getD1());
const storageUnavailable = () => response({
  status: 503,
  body: {
    error: {
      code: "STORAGE_UNAVAILABLE",
      message: "Canlı gözlem servisi şu anda kullanılamıyor.",
    },
  },
});

export async function GET() {
  try {
    return response(await listMineObservations(await repository()));
  } catch {
    return storageUnavailable();
  }
}

export async function POST(request: Request) {
  const invalidRequest = validateMineObservationWriteRequest(request);
  if (invalidRequest) return response(invalidRequest);

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 2048) {
    return response({
      status: 413,
      body: { error: { code: "PAYLOAD_TOO_LARGE", message: "İstek gövdesi çok büyük." } },
    });
  }

  const user = await getChatGPTUser();
  let body: string;
  try {
    body = await request.text();
  } catch {
    return response({
      status: 400,
      body: { error: { code: "INVALID_JSON", message: "Geçerli bir JSON gövdesi gerekli." } },
    });
  }

  if (new TextEncoder().encode(body).byteLength > 2048) {
    return response({
      status: 413,
      body: { error: { code: "PAYLOAD_TOO_LARGE", message: "İstek gövdesi çok büyük." } },
    });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return response({
      status: 400,
      body: { error: { code: "INVALID_JSON", message: "Geçerli bir JSON gövdesi gerekli." } },
    });
  }

  try {
    return response(await writeMineObservation(
      await repository(),
      user?.id ?? null,
      payload,
      { allowedRegionIds, allowedResourceIds },
    ));
  } catch {
    return storageUnavailable();
  }
}
