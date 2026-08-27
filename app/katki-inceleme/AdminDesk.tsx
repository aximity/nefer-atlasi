"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDisplayValue, humanizeIdentifier } from "../../lib/presentation.mjs";

type ListRow = {
  id: string;
  type: string;
  subject: string;
  server: string;
  observedAt: string;
  sourceCount: number;
  verificationStatus: string;
  publicationStatus: string;
  uploadStatus: string;
  createdAt: string;
  updatedAt: string;
};

type AdminDetail = {
  contribution: ListRow & {
    contributorAlias: string | null;
    contactPrivate: string | null;
    moderationNote: string | null;
    reviewedAt: string | null;
    publishedAt: string | null;
    payload: {
      common?: Record<string, unknown>;
      details?: Record<string, unknown>;
    };
  };
  files: {
    id: string;
    originalName: string;
    mediaKind: string;
    mimeType: string;
    byteSize: number;
    sha256: string;
    createdAt: string;
  }[];
  events: {
    id: string;
    action: string;
    actorLabel: string;
    fromVerification: string | null;
    toVerification: string | null;
    fromPublication: string | null;
    toPublication: string | null;
    note: string | null;
    createdAt: string;
  }[];
  similar: ListRow[];
};

type Counts = {
  verification: Record<string, number>;
  publication: Record<string, number>;
};

type MergePreview = {
  contribution: {
    id: string;
    verificationStatus: string;
    publicationStatus: string;
  };
  target: {
    entityType: string;
    entityKey: string;
    displayName: string;
  };
  current: {
    id: string;
    version: number;
    active: boolean;
    data: Record<string, unknown>;
    updatedAt: string;
  } | null;
  baseline: {
    source: "static_catalog";
    data: Record<string, unknown>;
  } | null;
  proposed: Record<string, unknown>;
  changes: { field: string; before: unknown; after: unknown }[];
  history: {
    id: string;
    action: string;
    version: number;
    actorLabel: string;
    note: string | null;
    createdAt: string;
  }[];
  canMerge: boolean;
  canRollback: boolean;
};

const kindLabels: Record<string, string> = {
  site_feedback: "Site yorumu",
  item_evidence: "Eşya",
  mining_run: "Maden",
  market_price: "Pazar",
  ability_media: "Yetenek",
};
const verificationLabels: Record<string, string> = {
  draft: "Taslak",
  single_source: "Tek kaynak",
  cross_verified: "Çapraz doğrulandı",
  conflicted: "Çelişkili",
  rejected: "Reddedildi",
};
const publicationLabels: Record<string, string> = {
  queued: "Kuyrukta",
  private: "Özel",
  published: "Yayında",
  archived: "Arşivlendi",
};
const actionLabels: Record<string, string> = {
  accept_single: "Tek kaynak kabul edildi",
  verify_cross: "Çapraz doğrulandı",
  mark_conflict: "Çelişkili işaretlendi",
  reject: "Reddedildi",
  publish: "Yayımlandı",
  unpublish: "Yayından kaldırıldı",
  return_draft: "Taslağa döndürüldü",
  save_note: "Editör notu güncellendi",
  merge_apply: "Ana veri katmanına işlendi",
  merge_rollback: "Ana veri sürümü geri alındı",
};
const entityLabels: Record<string, string> = {
  item: "Eşya kaydı",
  mining_route: "Maden rotası",
  market_observation: "Pazar gözlemi",
  ability_media: "Yetenek medyası",
};
const detailLabels: Record<string, string> = {
  className: "Sınıf",
  slot: "Yuva",
  levelTier: "Seviye / kademe",
  acquisitionPlace: "Elde edilme yeri",
  rarity: "Nadirlik",
  statLines: "Özellik satırları",
  appearanceProof: "Görünüş kanıtı",
  region: "Bölge",
  routeMinutes: "Tur süresi",
  nodeCount: "Damar / nokta",
  runCount: "Tur sayısı",
  yields: "Çıkan madenler",
  boosters: "Arttırıcılar",
  listingType: "Kayıt türü",
  quantity: "Miktar",
  currency: "Para türü",
  price: "Fiyat",
  channel: "Kanal",
  settledPrice: "Son fiyat",
  captureContext: "Kayıt ortamı",
  abilityPoints: "Yetenek puanı",
};

export default function AdminDesk({
  adminName,
  signOutHref,
}: {
  adminName: string;
  signOutHref: string;
}) {
  const [filter, setFilter] = useState("queued");
  const [kind, setKind] = useState("all");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [rows, setRows] = useState<ListRow[]>([]);
  const [counts, setCounts] = useState<Counts>({
    verification: {},
    publication: {},
  });
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState<AdminDetail | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [independenceConfirmed, setIndependenceConfirmed] = useState(false);
  const [publishConfirmed, setPublishConfirmed] = useState(false);
  const [acting, setActing] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const [merge, setMerge] = useState<MergePreview | null>(null);
  const [mergeLoading, setMergeLoading] = useState(false);
  const [mergeNote, setMergeNote] = useState("");
  const [mergeConfirmed, setMergeConfirmed] = useState(false);
  const [mergeActing, setMergeActing] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      setListLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          filter,
          kind,
          query: appliedSearch,
        });
        const response = await fetch("/api/admin/contributions?" + params, {
          signal: controller.signal,
        });
        const result = (await response.json()) as {
          rows?: ListRow[];
          counts?: Counts;
          error?: string;
        };
        if (!response.ok) throw new Error(result.error || "Kuyruk yüklenemedi.");
        const nextRows = result.rows ?? [];
        setRows(nextRows);
        setCounts(result.counts ?? { verification: {}, publication: {} });
        setSelectedId((current) =>
          current && nextRows.some((row) => row.id === current)
            ? current
            : nextRows[0]?.id ?? "",
        );
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Kuyruk yüklenemedi.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setListLoading(false);
      }
    };
    void run();
    return () => controller.abort();
  }, [appliedSearch, filter, kind, refreshToken]);

  useEffect(() => {
    if (!selectedId) {
      queueMicrotask(() => setDetail(null));
      return;
    }
    const controller = new AbortController();
    const run = async () => {
      setDetailLoading(true);
      setError("");
      try {
        const response = await fetch(
          "/api/admin/contributions/detail?id=" +
            encodeURIComponent(selectedId),
          { signal: controller.signal },
        );
        const result = (await response.json()) as AdminDetail & { error?: string };
        if (!response.ok) throw new Error(result.error || "Kayıt açılamadı.");
        setDetail(result);
        setNote(result.contribution.moderationNote ?? "");
        setIndependenceConfirmed(false);
        setPublishConfirmed(false);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Kayıt açılamadı.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setDetailLoading(false);
      }
    };
    void run();
    return () => controller.abort();
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) {
      queueMicrotask(() => setMerge(null));
      return;
    }
    const controller = new AbortController();
    const run = async () => {
      setMergeLoading(true);
      try {
        const response = await fetch(
          "/api/admin/contributions/merge?id=" + encodeURIComponent(selectedId),
          { signal: controller.signal },
        );
        const result = (await response.json()) as MergePreview & { error?: string };
        if (!response.ok) throw new Error(result.error || "Fark önizlemesi yüklenemedi.");
        setMerge(result);
        setMergeConfirmed(false);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setMerge(null);
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Fark önizlemesi yüklenemedi.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setMergeLoading(false);
      }
    };
    void run();
    return () => controller.abort();
  }, [refreshToken, selectedId]);

  const total =
    Object.values(counts.publication).reduce((sum, value) => sum + value, 0) ||
    rows.length;
  const detailEntries = useMemo(
    () => Object.entries(detail?.contribution.payload.details ?? {}),
    [detail],
  );

  const act = async (action: string) => {
    if (!selectedId || acting) return;
    setActing(action);
    setError("");
    try {
      const response = await fetch(
        "/api/admin/contributions/detail?id=" +
          encodeURIComponent(selectedId),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            note,
            independenceConfirmed,
          }),
        },
      );
      const result = (await response.json()) as AdminDetail & { error?: string };
      if (!response.ok) throw new Error(result.error || "Karar kaydedilemedi.");
      setDetail(result);
      setNote(result.contribution.moderationNote ?? "");
      setIndependenceConfirmed(false);
      setPublishConfirmed(false);
      setRefreshToken((current) => current + 1);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Karar kaydedilemedi.",
      );
    } finally {
      setActing("");
    }
  };

  const actMerge = async (action: "apply" | "rollback") => {
    if (!selectedId || !merge || mergeActing) return;
    setMergeActing(action);
    setError("");
    try {
      const response = await fetch(
        "/api/admin/contributions/merge?id=" + encodeURIComponent(selectedId),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            expectedVersion: merge.current?.version ?? 0,
            confirmed: mergeConfirmed,
            note: mergeNote,
          }),
        },
      );
      const result = (await response.json()) as MergePreview & { error?: string };
      if (!response.ok) throw new Error(result.error || "Ana veri işlemi tamamlanamadı.");
      setMerge(result);
      setMergeConfirmed(false);
      setMergeNote("");
      setRefreshToken((current) => current + 1);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Ana veri işlemi tamamlanamadı.",
      );
    } finally {
      setMergeActing("");
    }
  };

  return (
    <main className="adminShell">
      <header className="adminTopbar">
        <Link href="/" className="adminBrand">
          <i>N</i>
          <span>
            <b>NEFER ATLASI</b>
            <small>EDİTÖR MASASI</small>
          </span>
        </Link>
        <div>
          <span>
            <small>YETKİLİ EDİTÖR</small>
            <b>{adminName}</b>
          </span>
          <Link href="/">Ana site</Link>
          <a href={signOutHref}>Çıkış</a>
        </div>
      </header>

      <section className="adminOverview">
        <div>
          <p>SAHA KATKILARI · M8</p>
          <h1>Kanıtı incele.<br /><em>Ana veriye bağla.</em></h1>
        </div>
        <div className="adminStats">
          <Stat label="Toplam" value={total} tone="gold" />
          <Stat label="Kuyrukta" value={counts.publication.queued ?? 0} tone="amber" />
          <Stat label="Tek kaynak" value={counts.verification.single_source ?? 0} tone="blue" />
          <Stat label="Çapraz" value={counts.verification.cross_verified ?? 0} tone="green" />
          <Stat label="Çelişkili" value={counts.verification.conflicted ?? 0} tone="red" />
        </div>
      </section>

      <section className="adminFilters">
        <div className="filterChips">
          {[
            ["queued", "Kuyruk"],
            ["draft", "Taslak"],
            ["single_source", "Tek kaynak"],
            ["cross_verified", "Çapraz"],
            ["conflicted", "Çelişkili"],
            ["published", "Yayında"],
            ["archived", "Arşiv"],
            ["all", "Tümü"],
          ].map(([value, label]) => (
            <button
              className={filter === value ? "on" : ""}
              onClick={() => setFilter(value)}
              key={value}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="filterTools">
          <select value={kind} onChange={(event) => setKind(event.target.value)}>
            <option value="all">Tüm katkı türleri</option>
            <option value="site_feedback">Site yorumu</option>
            <option value="item_evidence">Eşya</option>
            <option value="mining_run">Maden</option>
            <option value="market_price">Pazar</option>
            <option value="ability_media">Yetenek</option>
          </select>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setAppliedSearch(search.trim());
            }}
          >
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Eşya, maden veya yetenek ara…"
            />
            <button>Ara</button>
          </form>
        </div>
      </section>

      {error && <p className="adminError">{error}</p>}

      <section className="adminWorkspace">
        <aside className="reviewQueue">
          <header>
            <span>
              <small>İNCELEME LİSTESİ</small>
              <b>{listLoading ? "Yükleniyor…" : rows.length + " kayıt"}</b>
            </span>
          </header>
          <div>
            {!listLoading &&
              rows.map((row) => (
                <button
                  className={selectedId === row.id ? "on" : ""}
                  onClick={() => setSelectedId(row.id)}
                  key={row.id}
                >
                  <span className="queueMeta">
                    <i>{kindLabels[row.type] ?? humanizeIdentifier(row.type)}</i>
                    <small>{row.observedAt}</small>
                  </span>
                  <b>{row.subject}</b>
                  <small>{row.server}</small>
                  <span className="queueStatus">
                    <i data-status={row.verificationStatus}>
                      {verificationLabels[row.verificationStatus] ??
                        row.verificationStatus}
                    </i>
                    <em>{row.sourceCount} kanıt</em>
                  </span>
                </button>
              ))}
            {!listLoading && rows.length === 0 && (
              <p className="queueEmpty">
                Bu filtrede katkı yok. Sessizlik bazen iyi haberdir.
              </p>
            )}
          </div>
        </aside>

        <article className="reviewDetail">
          {detailLoading ? (
            <div className="detailEmpty">Katkı ayrıntısı yükleniyor…</div>
          ) : !detail ? (
            <div className="detailEmpty">
              <i>◇</i>
              <b>İncelemek için bir katkı seç</b>
              <span>Yapılandırılmış veri ve kanıt burada açılır.</span>
            </div>
          ) : (
            <>
              <header className="detailHead">
                <div>
                  <small>
                    {kindLabels[detail.contribution.type]} ·{" "}
                    {detail.contribution.server}
                  </small>
                  <h2>{detail.contribution.subject}</h2>
                  <p>
                    Gözlem {detail.contribution.observedAt} · gönderim{" "}
                    {formatDate(detail.contribution.createdAt)}
                  </p>
                </div>
                <div className="detailStatus">
                  <span data-status={detail.contribution.verificationStatus}>
                    {verificationLabels[detail.contribution.verificationStatus] ??
                      humanizeIdentifier(detail.contribution.verificationStatus)}
                  </span>
                  <span data-publication={detail.contribution.publicationStatus}>
                    {publicationLabels[detail.contribution.publicationStatus] ??
                      humanizeIdentifier(detail.contribution.publicationStatus)}
                  </span>
                </div>
              </header>

              <div className="reviewColumns">
                <div className="reviewMain">
                  <Section title="Yapılandırılmış kayıt" count={detailEntries.length}>
                    <dl className="fieldTable">
                      {detailEntries.map(([key, value]) => (
                        <div key={key}>
                          <dt>{detailLabels[key] ?? humanizeIdentifier(key)}</dt>
                          <dd>{formatValue(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </Section>

                  <Section title="Kanıtlar" count={detail.files.length}>
                    {detail.files.length ? (
                      <div className="evidenceGrid">
                        {detail.files.map((file) => {
                          const url =
                            "/api/admin/contributions/file?id=" +
                            encodeURIComponent(file.id);
                          return (
                            <article key={file.id}>
                              <div className="evidencePreview">
                                {file.mediaKind === "video" ? (
                                  <video src={url} controls playsInline preload="metadata" />
                                ) : (
                                  // The endpoint is authenticated and intentionally bypasses image optimization.
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={url} alt={file.originalName} />
                                )}
                              </div>
                              <span>
                                <b>{file.originalName}</b>
                                <small>
                                  {file.mimeType} · {formatBytes(file.byteSize)}
                                </small>
                              </span>
                              <a href={url} target="_blank" rel="noreferrer">
                                Tam aç ↗
                              </a>
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="sectionEmpty">
                        Dosya yok; bağlantı kanıtlarını aşağıdan kontrol et.
                      </p>
                    )}
                    <SourceLinks
                      common={detail.contribution.payload.common ?? {}}
                    />
                  </Section>

                  <Section title="Editör kararı">
                    <label className="adminNote">
                      <span>Editör notu</span>
                      <textarea
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Kararın gerekçesi, eksik kanıt veya çelişki…"
                        maxLength={2000}
                      />
                    </label>
                    <label className="adminConfirm">
                      <input
                        type="checkbox"
                        checked={independenceConfirmed}
                        onChange={(event) =>
                          setIndependenceConfirmed(event.target.checked)
                        }
                      />
                      <span>
                        İki kanıtın gerçekten bağımsız olduğunu kontrol ettim.
                        Aynı görselin farklı gruplardaki kopyaları bağımsız
                        kaynak değildir.
                      </span>
                    </label>
                    {detail.contribution.verificationStatus ===
                      "cross_verified" && (
                      <label className="adminConfirm publish">
                        <input
                          type="checkbox"
                          checked={publishConfirmed}
                          onChange={(event) =>
                            setPublishConfirmed(event.target.checked)
                          }
                        />
                        <span>
                          Public kartta yalnız güvenli yapılandırılmış alanların
                          gösterileceğini onaylıyorum; dosya ve iletişim gizli kalır.
                        </span>
                      </label>
                    )}
                    <div className="decisionGrid">
                      <Action
                        label="Notu kaydet"
                        action="save_note"
                        tone="neutral"
                        acting={acting}
                        onClick={act}
                      />
                      <Action
                        label="Tek kaynak kabul"
                        action="accept_single"
                        tone="blue"
                        acting={acting}
                        onClick={act}
                      />
                      <Action
                        label="Çapraz doğrula"
                        action="verify_cross"
                        tone="green"
                        disabled={
                          !independenceConfirmed ||
                          detail.contribution.sourceCount < 2
                        }
                        acting={acting}
                        onClick={act}
                      />
                      <Action
                        label="Çelişkili"
                        action="mark_conflict"
                        tone="amber"
                        acting={acting}
                        onClick={act}
                      />
                      <Action
                        label="Reddet"
                        action="reject"
                        tone="red"
                        acting={acting}
                        onClick={act}
                      />
                      {detail.contribution.publicationStatus === "published" ? (
                        <Action
                          label="Yayından kaldır"
                          action="unpublish"
                          tone="red"
                          acting={acting}
                          onClick={act}
                        />
                      ) : (
                        <Action
                          label="Public karta yayımla"
                          action="publish"
                          tone="gold"
                          disabled={
                            detail.contribution.verificationStatus !==
                              "cross_verified" || !publishConfirmed
                          }
                          acting={acting}
                          onClick={act}
                        />
                      )}
                      <Action
                        label="Taslağa döndür"
                        action="return_draft"
                        tone="neutral"
                        acting={acting}
                        onClick={act}
                      />
                    </div>
                  </Section>

                  <Section title="Ana veri birleştirme">
                    {mergeLoading ? (
                      <p className="sectionEmpty">Fark önizlemesi hazırlanıyor…</p>
                    ) : merge ? (
                      <div className="mergeCenter">
                        <div className="mergeTarget">
                          <span>
                            <small>HEDEF KAYIT</small>
                            <b>{entityLabels[merge.target.entityType] ?? merge.target.entityType}</b>
                          </span>
                          <span>
                            <small>SÜRÜM</small>
                            <b>v{merge.current?.version ?? 0} → v{(merge.current?.version ?? 0) + 1}</b>
                          </span>
                          <i data-ready={merge.canMerge}>
                            {merge.current
                              ? merge.current.active
                                ? "Güncelleme"
                                : "Yeniden etkinleştirme"
                              : merge.baseline
                                ? "Katalog üst katmanı"
                              : "Yeni kayıt"}
                          </i>
                        </div>
                        <div className="mergeDiff" role="table" aria-label="Ana veri farkı">
                          <header role="row">
                            <span>Alan</span><span>Mevcut</span><span>Önerilen</span>
                          </header>
                          {merge.changes.map((change) => (
                            <div role="row" key={change.field}>
                              <b>{detailLabels[change.field] ?? change.field}</b>
                              <del>{formatValue(change.before)}</del>
                              <ins>{formatValue(change.after)}</ins>
                            </div>
                          ))}
                          {!merge.changes.length && (
                            <p>Alan farkı yok; kayıt zaten bu veriyi taşıyor.</p>
                          )}
                        </div>
                        <label className="adminNote mergeNote">
                          <span>Birleştirme / geri alma gerekçesi</span>
                          <textarea
                            value={mergeNote}
                            onChange={(event) => setMergeNote(event.target.value)}
                            placeholder="Hangi kanıtın hangi alanı doğruladığını kısaca yaz…"
                            maxLength={2000}
                          />
                        </label>
                        <label className="adminConfirm mergeConfirm">
                          <input
                            type="checkbox"
                            checked={mergeConfirmed}
                            onChange={(event) => setMergeConfirmed(event.target.checked)}
                          />
                          <span>
                            Mevcut ve önerilen alanları karşılaştırdım; bu sürümün ana veri
                            katmanında görünmesini onaylıyorum.
                          </span>
                        </label>
                        {!merge.canMerge && (
                          <p className="mergeGate">
                            Önce katkıyı çapraz doğrula ve public karta yayımla. Ana veri kapısı
                            bundan sonra açılır.
                          </p>
                        )}
                        <div className="mergeActions">
                          <button
                            data-tone="gold"
                            disabled={
                              !merge.canMerge ||
                              !mergeConfirmed ||
                              mergeNote.trim().length < 3 ||
                              Boolean(mergeActing) ||
                              (!merge.changes.length && Boolean(merge.current?.active))
                            }
                            onClick={() => void actMerge("apply")}
                          >
                            {mergeActing === "apply" ? "İşleniyor…" : "Ana veriye uygula"}
                          </button>
                          <button
                            data-tone="red"
                            disabled={
                              !merge.canRollback ||
                              !mergeConfirmed ||
                              mergeNote.trim().length < 3 ||
                              Boolean(mergeActing)
                            }
                            onClick={() => void actMerge("rollback")}
                          >
                            {mergeActing === "rollback" ? "Geri alınıyor…" : "Son sürümü geri al"}
                          </button>
                        </div>
                        {merge.history.length > 0 && (
                          <ol className="mergeHistory">
                            {merge.history.slice(0, 4).map((entry) => (
                              <li key={entry.id}>
                                <b>v{entry.version} · {entry.action === "apply" ? "uygulandı" : "geri alındı"}</b>
                                <span>{entry.actorLabel} · {formatDate(entry.createdAt)}</span>
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    ) : (
                      <p className="sectionEmpty">Bu kayıt için önizleme oluşturulamadı.</p>
                    )}
                  </Section>
                </div>

                <aside className="reviewSide">
                  <Section title="Katkıcı ve bağlam">
                    <Info label="Rumuz" value={detail.contribution.contributorAlias || "Belirtilmedi"} />
                    <Info label="Özel iletişim" value={detail.contribution.contactPrivate || "Belirtilmedi"} privateValue />
                    <Info
                      label="Not"
                      value={String(
                        detail.contribution.payload.common?.notes ||
                          "Not eklenmedi",
                      )}
                    />
                    <Info
                      label="Kanıt aktarımı"
                      value={detail.contribution.uploadStatus}
                    />
                  </Section>

                  <Section title="Benzer kayıtlar" count={detail.similar.length}>
                    {detail.similar.length ? (
                      <div className="similarList">
                        {detail.similar.map((row) => (
                          <button onClick={() => setSelectedId(row.id)} key={row.id}>
                            <b>{row.subject}</b>
                            <span>{row.server} · {row.observedAt}</span>
                            <small>
                              {verificationLabels[row.verificationStatus]} ·{" "}
                              {row.sourceCount} kanıt
                            </small>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="sectionEmpty">
                        Aynı başlıkta başka katkı bulunamadı.
                      </p>
                    )}
                  </Section>

                  <Section title="Denetim geçmişi" count={detail.events.length}>
                    {detail.events.length ? (
                      <ol className="eventTimeline">
                        {detail.events.map((event) => (
                          <li key={event.id}>
                            <i />
                            <span>
                              <b>{actionLabels[event.action] ?? event.action}</b>
                              <small>
                                {event.actorLabel} · {formatDate(event.createdAt)}
                              </small>
                              {event.note && <p>{event.note}</p>}
                            </span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="sectionEmpty">Henüz editör işlemi yok.</p>
                    )}
                  </Section>
                </aside>
              </div>
            </>
          )}
        </article>
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <article data-tone={tone}>
      <span>{label}</span>
      <b>{value}</b>
    </article>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="reviewSection">
      <header>
        <h3>{title}</h3>
        {count !== undefined && <span>{count}</span>}
      </header>
      {children}
    </section>
  );
}

function SourceLinks({ common }: { common: Record<string, unknown> }) {
  const links = [common.sourceUrl, common.secondarySourceUrl].filter(
    (value): value is string =>
      typeof value === "string" && /^https?:\/\//.test(value),
  );
  if (!links.length) return null;
  return (
    <div className="sourceLinks">
      {links.map((link, index) => (
        <a href={link} target="_blank" rel="noreferrer" key={link}>
          {index ? "İkinci kaynağı aç" : "Kaynağı aç"} ↗
        </a>
      ))}
    </div>
  );
}

function Info({
  label,
  value,
  privateValue = false,
}: {
  label: string;
  value: string;
  privateValue?: boolean;
}) {
  return (
    <div className="sideInfo">
      <span>
        {label}
        {privateValue && <i>YAYIMLANMAZ</i>}
      </span>
      <b>{value}</b>
    </div>
  );
}

function Action({
  label,
  action,
  tone,
  acting,
  disabled = false,
  onClick,
}: {
  label: string;
  action: string;
  tone: string;
  acting: string;
  disabled?: boolean;
  onClick: (action: string) => Promise<void>;
}) {
  return (
    <button
      type="button"
      data-tone={tone}
      disabled={disabled || Boolean(acting)}
      onClick={() => void onClick(action)}
    >
      {acting === action ? "Kaydediliyor…" : label}
    </button>
  );
}

function formatDate(value: string) {
  const parsed = new Date(value.includes("T") ? value : value.replace(" ", "T") + "Z");
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(parsed);
}

function formatBytes(value: number) {
  if (value < 1024 * 1024) return Math.round(value / 1024) + " KB";
  return (value / 1024 / 1024).toFixed(1) + " MB";
}

function formatValue(value: unknown) {
  return formatDisplayValue(value);
}
