import {
  CONTRIBUTION_LIMITS,
  ContributionValidationError,
  makeReceiptToken,
  safeOriginalName,
  sha256Hex,
  sniffEvidenceFile,
  stableStringify,
  storagePayload,
  validateContributionPayload,
} from "../../../lib/contribution-core.mjs";
import {
  attachContributionFile,
  createContribution,
  markUploadFailed,
  submissionCounts,
} from "../../../lib/contribution-repository.server";

export const runtime = "edge";

const json = (body: unknown, status: number) =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && !["same-origin", "none"].includes(fetchSite)) return false;
  if (!origin) return true;
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function routeError(error: unknown) {
  if (error instanceof ContributionValidationError) {
    return json({ error: error.message, field: error.field }, 400);
  }
  const message = error instanceof Error ? error.message : "";
  if (message.includes("D1 binding") || message.includes("no such table")) {
    return json(
      { error: "Katkı kuyruğu hazırlanıyor. Lütfen biraz sonra yeniden dene." },
      503,
    );
  }
  return json(
    { error: "Gönderim tamamlanamadı. Taslağın bu cihazda saklı kaldı." },
    500,
  );
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return json({ error: "Bu gönderim kaynağına izin verilmiyor." }, 403);
  }
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return json({ error: "Form veri biçimi desteklenmiyor." }, 415);
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (
    Number.isFinite(contentLength) &&
    contentLength > CONTRIBUTION_LIMITS.requestBytes
  ) {
    return json({ error: "Gönderim 13 MB sınırını aşıyor." }, 413);
  }

  let contributionId = "";
  let fileId = "";
  let objectKey = "";
  let bucket: R2Bucket | null = null;
  try {
    const form = await request.formData();
    const payloadEntry = form.get("payload");
    const fileEntry = form.get("file");
    if (typeof payloadEntry !== "string") {
      return json({ error: "Katkı verisi eksik." }, 400);
    }
    if (new TextEncoder().encode(payloadEntry).byteLength > CONTRIBUTION_LIMITS.payloadBytes) {
      return json({ error: "Metin alanları 32 KB sınırını aşıyor." }, 413);
    }
    const file =
      fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;
    const validated = validateContributionPayload(JSON.parse(payloadEntry), {
      hasFile: Boolean(file),
    });
    const privatePayload = storagePayload(validated);
    const clientTokenHash = await sha256Hex(validated.common.clientToken);
    const limits = await submissionCounts(clientTokenHash);
    if (limits.fifteenMinutes >= 5 || limits.day >= 25) {
      return json(
        {
          error:
            "Bu cihazdan kısa sürede çok sayıda katkı gönderildi. Daha sonra yeniden dene.",
        },
        429,
      );
    }

    let fileBytes: Uint8Array | null = null;
    let filePolicy: ReturnType<typeof sniffEvidenceFile> | null = null;
    let fileHash = "";
    if (file) {
      if (file.size > CONTRIBUTION_LIMITS.videoBytes) {
        return json({ error: "Dosya 12 MB sınırını aşıyor." }, 413);
      }
      fileBytes = new Uint8Array(await file.arrayBuffer());
      filePolicy = sniffEvidenceFile(fileBytes, file.type, validated.kind);
      fileHash = await sha256Hex(fileBytes);
    }

    const storedJson = stableStringify(privatePayload);
    const payloadHash = await sha256Hex(storedJson + "|" + fileHash);
    const receipt = makeReceiptToken();
    const receiptTokenHash = await sha256Hex(receipt);
    contributionId = crypto.randomUUID();
    fileId = file ? crypto.randomUUID() : "";
    const sourceCount =
      Number(Boolean(validated.common.sourceUrl)) +
      Number(Boolean(validated.common.secondarySourceUrl)) +
      Number(Boolean(file));

    await createContribution({
      id: contributionId,
      receiptTokenHash,
      type: validated.kind,
      subject: String(validated.details.subject),
      server: validated.common.server,
      observedAt: validated.common.observedAt,
      payloadJson: storedJson,
      payloadHash,
      clientTokenHash,
      sourceCount,
      contributorAlias: validated.common.alias || null,
      contactPrivate: validated.common.contact || null,
      uploadStatus: file ? "uploading" : "complete",
    });

    if (file && fileBytes && filePolicy) {
      const { env } = await import("cloudflare:workers");
      bucket = env.BUCKET;
      objectKey =
        "quarantine/" +
        contributionId +
        "/" +
        fileId +
        (filePolicy.mediaKind === "video" ? ".media" : ".image");
      await bucket.put(objectKey, fileBytes, {
        httpMetadata: { contentType: filePolicy.mimeType },
        customMetadata: {
          contributionId,
          fileId,
          sha256: fileHash,
        },
      });
      try {
        await attachContributionFile({
          id: fileId,
          contributionId,
          r2Key: objectKey,
          originalName: safeOriginalName(file.name),
          mediaKind: filePolicy.mediaKind,
          mimeType: filePolicy.mimeType,
          byteSize: fileBytes.byteLength,
          sha256: fileHash,
        });
      } catch (error) {
        await bucket.delete(objectKey);
        await markUploadFailed(contributionId, fileId);
        throw error;
      }
    }

    return json(
      {
        receipt,
        verificationStatus: "draft",
        publicationStatus: "queued",
        message:
          "Katkın inceleme kuyruğuna alındı. Henüz yayımlanmış veya doğrulanmış sayılmaz.",
      },
      202,
    );
  } catch (error) {
    if (objectKey && contributionId && bucket) {
      try {
        await bucket.delete(objectKey);
      } catch {
        // The object remains private in quarantine and can be cleaned up later.
      }
      try {
        await markUploadFailed(contributionId, fileId || undefined);
      } catch {
        // Preserve the original error; no internal identifiers are returned.
      }
    }
    if (error instanceof SyntaxError) {
      return json({ error: "Katkı verisi okunamadı." }, 400);
    }
    return routeError(error);
  }
}
