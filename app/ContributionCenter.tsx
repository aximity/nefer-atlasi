"use client";

import { useEffect, useMemo, useState } from "react";

type ContributionKind =
  | "item_evidence"
  | "mining_run"
  | "market_price"
  | "ability_media";

type Fields = {
  server: string;
  observedAt: string;
  alias: string;
  contact: string;
  notes: string;
  sourceUrl: string;
  secondarySourceUrl: string;
  website: string;
  declaration: boolean;
  subject: string;
  className: string;
  slot: string;
  levelTier: string;
  acquisitionPlace: string;
  rarity: string;
  statLines: string;
  appearanceProof: boolean;
  region: string;
  routeMinutes: string;
  nodeCount: string;
  runCount: string;
  yields: string;
  boosters: string;
  listingType: string;
  quantity: string;
  currency: string;
  price: string;
  channel: string;
  settledPrice: string;
  captureContext: string;
  abilityPoints: string;
  mediaRights: boolean;
};

type StatusResult = {
  type: ContributionKind;
  verificationStatus: string;
  publicationStatus: string;
  uploadStatus: string;
  createdAt: string;
  updatedAt: string;
};

type PublishedContribution = {
  id: string;
  type: ContributionKind;
  subject: string;
  server: string;
  observedAt: string;
  sourceCount: number;
  publishedAt: string | null;
  details: Record<string, unknown>;
};

type CanonicalRecord = {
  id: string;
  entityType: string;
  displayName: string;
  version: number;
  updatedAt: string;
  data: Record<string, unknown>;
};

const DRAFT_KEY = "nefer-atlasi-contribution-draft-v1";
const CLIENT_KEY = "nefer-atlasi-anonymous-client-v1";
const kinds: {
  id: ContributionKind;
  mark: string;
  title: string;
  description: string;
  proof: string;
}[] = [
  {
    id: "item_evidence",
    mark: "E",
    title: "Eşya kanıtı",
    description: "Ad, özellik, görünüş ve elde edilme kaydı",
    proof: "Ad ile görünüş aynı karedeyse ayrıca işaretle.",
  },
  {
    id: "mining_run",
    mark: "M",
    title: "Maden turu",
    description: "Bölge, süre, rota, damar ve arttırıcı",
    proof: "Tek şanslı tur yerine kaç turun ölçüldüğünü yaz.",
  },
  {
    id: "market_price",
    mark: "P",
    title: "Pazar fiyatı",
    description: "İlan veya gerçekleşen satış gözlemi",
    proof: "Oyun parası ile TL ayrı seridir; çevrim yapılmaz.",
  },
  {
    id: "ability_media",
    mark: "Y",
    title: "Yetenek medyası",
    description: "Kısa oyun içi görsel veya video kanıtı",
    proof: "MP4/WebM video otomatik oynatılmaz ve ses açılmaz.",
  },
];
const kindNames = Object.fromEntries(kinds.map((kind) => [kind.id, kind.title]));
const steps = ["Kayıt", "Kanıt", "Kontrol"];
const classNames = ["Savaşçı", "Büyücü", "Şifacı"];
const slots = [
  "Silah",
  "Eldiven",
  "Ceket",
  "Yüzük",
  "Kolye",
  "Ayakkabı",
  "Pantolon",
  "Gözlük",
];

const localDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const freshFields = (): Fields => ({
  server: "Kıyamet Öncüleri",
  observedAt: "",
  alias: "",
  contact: "",
  notes: "",
  sourceUrl: "",
  secondarySourceUrl: "",
  website: "",
  declaration: false,
  subject: "",
  className: "Savaşçı",
  slot: "Silah",
  levelTier: "",
  acquisitionPlace: "",
  rarity: "Belirsiz",
  statLines: "",
  appearanceProof: false,
  region: "",
  routeMinutes: "",
  nodeCount: "",
  runCount: "1",
  yields: "",
  boosters: "Yok",
  listingType: "İlan",
  quantity: "1",
  currency: "Oyun parası",
  price: "",
  channel: "Oyun içi sohbet",
  settledPrice: "",
  captureContext: "PvE",
  abilityPoints: "",
  mediaRights: false,
});

const verificationLabels: Record<string, string> = {
  draft: "Taslak · inceleme bekliyor",
  single_source: "Tek kaynak",
  cross_verified: "Çapraz doğrulandı",
  conflicted: "Çelişkili",
  rejected: "Reddedildi",
};
const publicationLabels: Record<string, string> = {
  private: "Özel",
  queued: "İnceleme kuyruğunda",
  published: "Yayında",
  archived: "Arşivlendi",
};
const uploadLabels: Record<string, string> = {
  complete: "Kanıt aktarımı tamam",
  uploading: "Kanıt aktarılıyor",
  upload_failed: "Kanıt aktarımı başarısız",
};

export default function ContributionCenter() {
  const [kind, setKind] = useState<ContributionKind>("item_evidence");
  const [fields, setFields] = useState<Fields>(freshFields);
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [clientToken, setClientToken] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [draftNotice, setDraftNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState("");
  const [receiptMessage, setReceiptMessage] = useState("");
  const [statusCode, setStatusCode] = useState("");
  const [statusResult, setStatusResult] = useState<StatusResult | null>(null);
  const [statusError, setStatusError] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const hydrate = () => {
      const requestedKind = new URLSearchParams(window.location.search).get("kind");
      let token = localStorage.getItem(CLIENT_KEY) ?? "";
      if (!/^[A-Za-z0-9_-]{20,128}$/.test(token)) {
        token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
        localStorage.setItem(CLIENT_KEY, token);
      }
      setClientToken(token);
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        try {
          const draft = JSON.parse(saved) as {
            kind?: ContributionKind;
            fields?: Partial<Fields>;
          };
          const hasRequestedKind = kinds.some((item) => item.id === requestedKind);
          if (hasRequestedKind) setKind(requestedKind as ContributionKind);
          else if (kinds.some((item) => item.id === draft.kind)) setKind(draft.kind!);
          if (draft.fields && (!hasRequestedKind || requestedKind === draft.kind)) {
            setFields({ ...freshFields(), ...draft.fields, observedAt: draft.fields.observedAt || localDate() });
            setDraftNotice("Bu cihazdaki gönderilmemiş taslak açıldı.");
          } else {
            setFields((current) => ({ ...current, observedAt: localDate() }));
          }
        } catch {
          localStorage.removeItem(DRAFT_KEY);
        }
      } else {
        if (kinds.some((item) => item.id === requestedKind)) setKind(requestedKind as ContributionKind);
        setFields((current) => ({ ...current, observedAt: localDate() }));
      }
      setHydrated(true);
    };
    queueMicrotask(hydrate);
  }, []);

  useEffect(() => {
    if (!hydrated || receipt) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ kind, fields }));
  }, [fields, hydrated, kind, receipt]);

  const selectedKind = kinds.find((item) => item.id === kind)!;
  const set = <K extends keyof Fields>(name: K, value: Fields[K]) => {
    setFields((current) => ({ ...current, [name]: value }));
    setDraftNotice("Taslak bu cihazda saklandı; henüz gönderilmedi.");
    setFormError("");
  };
  const evidenceReady = Boolean(file || fields.sourceUrl || fields.secondarySourceUrl);
  const stepOneMissing = useMemo(() => {
    const missing: string[] = [];
    if (!fields.server.trim()) missing.push("sunucu");
    if (!fields.observedAt) missing.push("gözlem tarihi");
    if (!fields.subject.trim()) {
      missing.push(
        kind === "item_evidence"
          ? "eşya adı"
          : kind === "mining_run"
            ? "maden adı"
            : kind === "market_price"
              ? "eşya/maden adı"
              : "yetenek adı",
      );
    }
    if (kind === "item_evidence") {
      if (!fields.levelTier.trim()) missing.push("seviye/kademe");
      if (!fields.acquisitionPlace.trim()) missing.push("elde edilme yeri");
    } else if (kind === "mining_run") {
      if (!fields.region.trim()) missing.push("bölge");
      if (!fields.routeMinutes) missing.push("tur süresi");
      if (!fields.nodeCount) missing.push("damar sayısı");
      if (!fields.runCount) missing.push("tur sayısı");
      if (!fields.yields.trim()) missing.push("çıkan madenler");
      if (!fields.boosters.trim()) missing.push("arttırıcılar");
    } else if (kind === "market_price") {
      if (!fields.quantity) missing.push("miktar");
      if (!fields.price) missing.push("fiyat");
    }
    return missing;
  }, [fields, kind]);

  const goNext = () => {
    if (step === 1 && stepOneMissing.length) {
      setFormError("Devam etmeden önce tamamla: " + stepOneMissing.join(", ") + ".");
      return;
    }
    if (step === 2) {
      const missing = [];
      if (!evidenceReady) missing.push("kanıt dosyası veya bağlantısı");
      if (!fields.declaration) missing.push("gözlem/kaynak onayı");
      if (kind === "ability_media" && !fields.mediaRights) {
        missing.push("medya paylaşım hakkı onayı");
      }
      if (missing.length) {
        setFormError("Devam etmeden önce tamamla: " + missing.join(", ") + ".");
        return;
      }
    }
    setFormError("");
    setStep((current) => Math.min(3, current + 1));
  };

  const payload = () => {
    const common = {
      server: fields.server,
      observedAt: fields.observedAt,
      alias: fields.alias,
      contact: fields.contact,
      notes: fields.notes,
      sourceUrl: fields.sourceUrl,
      secondarySourceUrl: fields.secondarySourceUrl,
      declaration: fields.declaration,
      clientToken,
      startedAt,
      website: fields.website,
    };
    if (kind === "item_evidence") {
      return {
        kind,
        common,
        details: {
          subject: fields.subject,
          className: fields.className,
          slot: fields.slot,
          levelTier: fields.levelTier,
          acquisitionPlace: fields.acquisitionPlace,
          rarity: fields.rarity,
          statLines: fields.statLines,
          appearanceProof: fields.appearanceProof,
        },
      };
    }
    if (kind === "mining_run") {
      return {
        kind,
        common,
        details: {
          subject: fields.subject,
          region: fields.region,
          routeMinutes: Number(fields.routeMinutes),
          nodeCount: Number(fields.nodeCount),
          runCount: Number(fields.runCount),
          yields: fields.yields,
          boosters: fields.boosters,
        },
      };
    }
    if (kind === "market_price") {
      return {
        kind,
        common,
        details: {
          subject: fields.subject,
          listingType: fields.listingType,
          quantity: Number(fields.quantity),
          currency: fields.currency,
          price: Number(fields.price),
          channel: fields.channel,
          settledPrice: fields.settledPrice ? Number(fields.settledPrice) : null,
        },
      };
    }
    return {
      kind,
      common,
      details: {
        subject: fields.subject,
        className: fields.className,
        captureContext: fields.captureContext,
        abilityPoints: fields.abilityPoints ? Number(fields.abilityPoints) : null,
        mediaRights: fields.mediaRights,
      },
    };
  };

  const submit = async () => {
    if (!clientToken || submitting) return;
    setSubmitting(true);
    setFormError("");
    try {
      const body = new FormData();
      body.set("payload", JSON.stringify(payload()));
      if (file) body.set("file", file);
      const response = await fetch("/api/contributions", {
        method: "POST",
        body,
      });
      const result = (await response.json()) as {
        receipt?: string;
        message?: string;
        error?: string;
      };
      if (!response.ok || !result.receipt) {
        throw new Error(result.error || "Gönderim tamamlanamadı.");
      }
      setReceipt(result.receipt);
      setReceiptMessage(result.message ?? "");
      setStatusCode(result.receipt);
      localStorage.removeItem(DRAFT_KEY);
      setDraftNotice("");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Bağlantı kurulamadı. Taslağın bu cihazda saklı kaldı.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setFields({ ...freshFields(), observedAt: localDate() });
    setKind("item_evidence");
    setFile(null);
    setReceipt("");
    setReceiptMessage("");
    setStep(1);
    setStartedAt(Date.now());
    setFormError("");
  };

  const lookupStatus = async () => {
    setStatusLoading(true);
    setStatusError("");
    setStatusResult(null);
    try {
      const response = await fetch(
        "/api/contributions/status?code=" + encodeURIComponent(statusCode),
      );
      const result = (await response.json()) as StatusResult & { error?: string };
      if (!response.ok) throw new Error(result.error || "Durum sorgulanamadı.");
      setStatusResult(result);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Durum sorgulanamadı.");
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <section className="contributionCenter" id="contribute">
      <div className="contributionIntro">
        <div>
          <p className="eyebrow">M8 · SAHA KATKI VE ANA VERİ MERKEZİ</p>
          <h2>Gözlemi kanıta dönüştür</h2>
          <p>
            Hesap açmadan katkı gönder. Kayıt önce özel inceleme kuyruğuna
            girer; hiçbir bilgi otomatik olarak doğru veya yayımlanmış sayılmaz.
          </p>
        </div>
        <div className="privacyBadge">
          <b>ANONİM KATKI</b>
          <span>Rumuz ve iletişim isteğe bağlı</span>
          <small>Dosyalar doğrudan herkese açılmaz</small>
        </div>
      </div>

      <div className="workflowRail" aria-label="Katkı doğrulama akışı">
        {[
          ["01", "Taslak", "İnceleme bekler"],
          ["02", "Tek kaynak", "İlk kanıt eşleşir"],
          ["03", "Çapraz doğrulandı", "Bağımsız ikinci kanıt"],
          ["04", "Ana veride", "Sürümlü ve geri alınabilir"],
        ].map(([number, label, description]) => (
          <div key={number}>
            <i>{number}</i>
            <span>
              <b>{label}</b>
              <small>{description}</small>
            </span>
          </div>
        ))}
      </div>

      <div className="contributionWorkspace">
        <aside className="kindPicker" aria-label="Katkı türü">
          <small>KATKI TÜRÜ</small>
          {kinds.map((item) => (
            <button
              type="button"
              className={kind === item.id ? "on" : ""}
              aria-pressed={kind === item.id}
              onClick={() => {
                setKind(item.id);
                setStep(1);
                setFormError("");
                setStartedAt(Date.now());
              }}
              key={item.id}
            >
              <i>{item.mark}</i>
              <span>
                <b>{item.title}</b>
                <small>{item.description}</small>
              </span>
            </button>
          ))}
        </aside>

        <form
          className="contributionForm"
          onSubmit={(event) => {
            event.preventDefault();
            if (step < 3) goNext();
            else void submit();
          }}
        >
          {receipt ? (
            <div className="contributionSuccess">
              <i>✓</i>
              <small>İNCELEME KUYRUĞUNA ALINDI</small>
              <h3>Katkın kaydedildi</h3>
              <p>{receiptMessage}</p>
              <label>
                Katkı numaran
                <strong>{receipt}</strong>
              </label>
              <p className="receiptWarning">
                Bu numara yalnız durum sorgulamak içindir. Ekran görüntüsünü al
                veya güvenli bir yere kopyala; kaybolursa yeniden gösterilemez.
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => void navigator.clipboard.writeText(receipt)}
                >
                  Numarayı kopyala
                </button>
                <button type="button" className="quiet" onClick={reset}>
                  Yeni katkı
                </button>
              </div>
            </div>
          ) : (
            <>
              <header className="contributionFormHead">
                <div>
                  <small>{selectedKind.title.toUpperCase()}</small>
                  <h3>{steps[step - 1]}</h3>
                </div>
                <nav aria-label="Form adımları">
                  {steps.map((label, index) => (
                    <button
                      type="button"
                      className={step === index + 1 ? "on" : ""}
                      aria-current={step === index + 1 ? "step" : undefined}
                      onClick={() => {
                        if (index + 1 < step) setStep(index + 1);
                      }}
                      key={label}
                    >
                      {index + 1}
                    </button>
                  ))}
                </nav>
              </header>

              {step === 1 && (
                <div className="formStage">
                  <div className="formGrid two">
                    <Input
                      label="Sunucu"
                      value={fields.server}
                      onChange={(value) => set("server", value)}
                      placeholder="Örn. Kıyamet Öncüleri"
                      required
                    />
                    <Input
                      label="Gözlem tarihi"
                      type="date"
                      value={fields.observedAt}
                      onChange={(value) => set("observedAt", value)}
                      required
                    />
                  </div>
                  <Input
                    label={
                      kind === "item_evidence"
                        ? "Eşya adı"
                        : kind === "mining_run"
                          ? "Maden adı"
                          : kind === "market_price"
                            ? "Eşya veya maden adı"
                            : "Yetenek adı"
                    }
                    value={fields.subject}
                    onChange={(value) => set("subject", value)}
                    maxLength={120}
                    required
                  />
                  {kind === "item_evidence" && (
                    <>
                      <div className="formGrid two">
                        <Select
                          label="Sınıf"
                          value={fields.className}
                          options={classNames}
                          onChange={(value) => set("className", value)}
                        />
                        <Select
                          label="Yuva"
                          value={fields.slot}
                          options={slots}
                          onChange={(value) => set("slot", value)}
                        />
                        <Input
                          label="Seviye / kademe"
                          value={fields.levelTier}
                          onChange={(value) => set("levelTier", value)}
                          placeholder="Örn. 49 / 3. kademe"
                          required
                        />
                        <Select
                          label="Nadirlik / efsun rengi"
                          value={fields.rarity}
                          options={["Belirsiz", "Tek efsun", "Çift efsun", "Nadir", "Şaheser"]}
                          onChange={(value) => set("rarity", value)}
                        />
                      </div>
                      <Input
                        label="Elde edilme yeri"
                        value={fields.acquisitionPlace}
                        onChange={(value) => set("acquisitionPlace", value)}
                        placeholder="Bölge · düşman/boss · üretim · dükkân"
                        required
                      />
                      <TextArea
                        label="Özellik satırları"
                        value={fields.statLines}
                        onChange={(value) => set("statLines", value)}
                        placeholder={"Her satıra bir özellik yazabilirsin.\nÖrn. Büyü Kritik: 4.354"}
                      />
                      <Check
                        checked={fields.appearanceProof}
                        onChange={(value) => set("appearanceProof", value)}
                        label="Eşya adı ile oyun içi görünüş aynı kanıt karesinde görünüyor."
                      />
                    </>
                  )}
                  {kind === "mining_run" && (
                    <>
                      <Input
                        label="Bölge"
                        value={fields.region}
                        onChange={(value) => set("region", value)}
                        placeholder="Örn. Lojman / Holden"
                        required
                      />
                      <div className="formGrid three">
                        <Input
                          label="Tur süresi (dk.)"
                          type="number"
                          min="1"
                          max="720"
                          value={fields.routeMinutes}
                          onChange={(value) => set("routeMinutes", value)}
                          required
                        />
                        <Input
                          label="Damar / nokta"
                          type="number"
                          min="1"
                          value={fields.nodeCount}
                          onChange={(value) => set("nodeCount", value)}
                          required
                        />
                        <Input
                          label="Ölçülen tur"
                          type="number"
                          min="1"
                          value={fields.runCount}
                          onChange={(value) => set("runCount", value)}
                          required
                        />
                      </div>
                      <TextArea
                        label="Çıkan madenler ve adetleri"
                        value={fields.yields}
                        onChange={(value) => set("yields", value)}
                        placeholder={"Örn. Xenotim: 2\nJadeit: 5"}
                        required
                      />
                      <Input
                        label="Kullanılan arttırıcılar"
                        value={fields.boosters}
                        onChange={(value) => set("boosters", value)}
                        placeholder="Yok / bölge / lonca / karakter / etkinlik"
                        required
                      />
                    </>
                  )}
                  {kind === "market_price" && (
                    <>
                      <div className="formGrid two">
                        <Select
                          label="Kayıt türü"
                          value={fields.listingType}
                          options={["İlan", "Gerçekleşen satış"]}
                          onChange={(value) => set("listingType", value)}
                        />
                        <Select
                          label="Kanal"
                          value={fields.channel}
                          options={[
                            "Oyun içi sohbet",
                            "Discord",
                            "WhatsApp",
                            "Facebook",
                            "Özel takas",
                          ]}
                          onChange={(value) => set("channel", value)}
                        />
                      </div>
                      <div className="formGrid three">
                        <Input
                          label="Miktar / adet"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={fields.quantity}
                          onChange={(value) => set("quantity", value)}
                          required
                        />
                        <Select
                          label="Para türü"
                          value={fields.currency}
                          options={["Oyun parası", "TL"]}
                          onChange={(value) => set("currency", value)}
                        />
                        <Input
                          label="Görülen fiyat"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={fields.price}
                          onChange={(value) => set("price", value)}
                          required
                        />
                      </div>
                      <Input
                        label="Pazarlık / gerçekleşen son fiyat (isteğe bağlı)"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={fields.settledPrice}
                        onChange={(value) => set("settledPrice", value)}
                      />
                      <p className="marketDisclaimer">
                        Topluluk piyasa gözlemidir; satış teklifi veya fiyat
                        garantisi değildir. Satıcı adı, telefon, IBAN ya da hesap
                        bilgisi ekleme.
                      </p>
                    </>
                  )}
                  {kind === "ability_media" && (
                    <>
                      <div className="formGrid two">
                        <Select
                          label="Sınıf"
                          value={fields.className}
                          options={classNames}
                          onChange={(value) => set("className", value)}
                        />
                        <Select
                          label="Kayıt ortamı"
                          value={fields.captureContext}
                          options={["PvE", "PvP", "Grup bölgesi", "Boş hedef"]}
                          onChange={(value) => set("captureContext", value)}
                        />
                      </div>
                      <Input
                        label="Yetenek puanı (isteğe bağlı)"
                        type="number"
                        min="0"
                        max="15"
                        value={fields.abilityPoints}
                        onChange={(value) => set("abilityPoints", value)}
                      />
                    </>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="formStage">
                  <div className="evidenceDrop">
                    <span>OYUN İÇİ KANIT</span>
                    <b>{file ? file.name : "Dosya seç veya kaynak bağlantısı ekle"}</b>
                    <p>
                      {kind === "ability_media"
                        ? "JPG, PNG, WebP en fazla 5 MB · MP4/WebM en fazla 12 MB"
                        : "JPG, PNG veya WebP · en fazla 5 MB"}
                    </p>
                    <label>
                      Dosya seç
                      <input
                        type="file"
                        accept={
                          kind === "ability_media"
                            ? "image/jpeg,image/png,image/webp,video/mp4,video/webm"
                            : "image/jpeg,image/png,image/webp"
                        }
                        onChange={(event) => {
                          setFile(event.target.files?.[0] ?? null);
                          setFormError("");
                        }}
                      />
                    </label>
                    {file && (
                      <button type="button" onClick={() => setFile(null)}>
                        Dosyayı kaldır
                      </button>
                    )}
                  </div>
                  <div className="formGrid two">
                    <Input
                      label="Kaynak bağlantısı"
                      type="url"
                      value={fields.sourceUrl}
                      onChange={(value) => set("sourceUrl", value)}
                      placeholder="https://…"
                    />
                    <Input
                      label="İkinci bağımsız kaynak (isteğe bağlı)"
                      type="url"
                      value={fields.secondarySourceUrl}
                      onChange={(value) => set("secondarySourceUrl", value)}
                      placeholder="https://…"
                    />
                  </div>
                  <div className="privacyCallout">
                    <b>Gizlilik kontrolü</b>
                    <p>
                      Oyuncu adını, özel sohbeti, telefon numarasını ve hesap
                      bilgisini kırp veya bulanıklaştır. Dosya önce herkese kapalı
                      karantina alanına gider; editör onayı olmadan yayımlanmaz.
                    </p>
                  </div>
                  <div className="formGrid two">
                    <Input
                      label="Katkıcı rumuzu (isteğe bağlı)"
                      value={fields.alias}
                      onChange={(value) => set("alias", value)}
                      maxLength={40}
                    />
                    <Input
                      label="İnceleme iletişimi (isteğe bağlı)"
                      value={fields.contact}
                      onChange={(value) => set("contact", value)}
                      placeholder="E-posta veya Discord rumuzu"
                      maxLength={160}
                    />
                  </div>
                  <TextArea
                    label="Açıklama / rota notu"
                    value={fields.notes}
                    onChange={(value) => set("notes", value)}
                    maxLength={2000}
                  />
                  <Check
                    checked={fields.declaration}
                    onChange={(value) => set("declaration", value)}
                    label="Bilgiyi kendim gözlemledim veya özgün kaynağını belirttim."
                  />
                  {kind === "ability_media" && (
                    <Check
                      checked={fields.mediaRights}
                      onChange={(value) => set("mediaRights", value)}
                      label="Bu medyayı paylaşma hakkına sahibim."
                    />
                  )}
                  <label className="honeypot" aria-hidden="true">
                    Website
                    <input
                      tabIndex={-1}
                      autoComplete="off"
                      value={fields.website}
                      onChange={(event) => set("website", event.target.value)}
                    />
                  </label>
                </div>
              )}

              {step === 3 && (
                <div className="formStage">
                  <div className="reviewCard">
                    <small>GÖNDERİM ÖZETİ</small>
                    <h4>{fields.subject}</h4>
                    <dl>
                      <div>
                        <dt>Tür</dt>
                        <dd>{selectedKind.title}</dd>
                      </div>
                      <div>
                        <dt>Sunucu</dt>
                        <dd>{fields.server}</dd>
                      </div>
                      <div>
                        <dt>Tarih</dt>
                        <dd>{fields.observedAt}</dd>
                      </div>
                      <div>
                        <dt>Kanıt</dt>
                        <dd>
                          {[
                            file && "1 dosya",
                            fields.sourceUrl && "1 bağlantı",
                            fields.secondarySourceUrl && "1 ikinci kaynak",
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="queueNotice">
                    <i>!</i>
                    <span>
                      <b>Bu kayıt hemen yayımlanmayacak.</b>
                      <small>
                        Önce taslak olarak kuyruğa girer. Tek kaynak ve çapraz
                        doğrulama etiketleri yalnız editör incelemesiyle verilir.
                      </small>
                    </span>
                  </div>
                </div>
              )}

              {formError && (
                <p className="contributionError" role="alert">
                  {formError}
                </p>
              )}
              {draftNotice && !formError && (
                <p className="draftNotice">{draftNotice}</p>
              )}
              <div className="formActions">
                <button
                  type="button"
                  className="quiet"
                  disabled={step === 1}
                  onClick={() => setStep((current) => Math.max(1, current - 1))}
                >
                  Geri
                </button>
                {step < 3 ? (
                  <button type="button" onClick={goNext}>
                    İleri
                  </button>
                ) : (
                  <button type="submit" disabled={submitting || !clientToken}>
                    {submitting ? "Gönderiliyor…" : "İncelemeye gönder"}
                  </button>
                )}
              </div>
            </>
          )}
        </form>

        <aside className="contributionAside">
          <small>KANIT STANDARDI</small>
          <h3>{selectedKind.title}</h3>
          <p>{selectedKind.proof}</p>
          <div>
            <span>Form</span>
            <b>{stepOneMissing.length ? stepOneMissing.length + " alan eksik" : "Temel alanlar hazır"}</b>
          </div>
          <div>
            <span>Kanıt</span>
            <b>{evidenceReady ? "Eklendi" : "Bekleniyor"}</b>
          </div>
          <div>
            <span>Yayın</span>
            <b>Yalnız editör kararı</b>
          </div>
          <p className="asideFoot">
            Aynı ekran görüntüsünün farklı gruplarda paylaşılması iki bağımsız
            kaynak sayılmaz.
          </p>
        </aside>
      </div>

      <div className="receiptLookup">
        <div>
          <p className="eyebrow">KATKI DURUMU</p>
          <h3>Makbuz numarasıyla izle</h3>
          <p>
            Sorgu yalnız doğrulama, yayın ve aktarım durumunu gösterir; katkı
            içeriği ile özel iletişim bilgisi geri verilmez.
          </p>
        </div>
        <div className="lookupPanel">
          <label>
            Katkı numarası
            <input
              value={statusCode}
              onChange={(event) => setStatusCode(event.target.value)}
              placeholder="NA-XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
            />
          </label>
          <button type="button" disabled={statusLoading} onClick={() => void lookupStatus()}>
            {statusLoading ? "Sorgulanıyor…" : "Durumu sorgula"}
          </button>
          {statusError && <p className="contributionError">{statusError}</p>}
          {statusResult && (
            <div className="statusResult">
              <small>{kindNames[statusResult.type] ?? statusResult.type}</small>
              <p>
                <span>Doğrulama</span>
                <b>{verificationLabels[statusResult.verificationStatus] ?? statusResult.verificationStatus}</b>
              </p>
              <p>
                <span>Yayın</span>
                <b>{publicationLabels[statusResult.publicationStatus] ?? statusResult.publicationStatus}</b>
              </p>
              <p>
                <span>Kanıt</span>
                <b>{uploadLabels[statusResult.uploadStatus] ?? statusResult.uploadStatus}</b>
              </p>
            </div>
          )}
        </div>
      </div>
      <PublishedEvidence />
    </section>
  );
}

function PublishedEvidence() {
  const [rows, setRows] = useState<PublishedContribution[]>([]);
  const [canonical, setCanonical] = useState<CanonicalRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const [publishedResponse, canonicalResponse] = await Promise.all([
          fetch("/api/contributions/published"),
          fetch("/api/catalog/verified"),
        ]);
        const publishedResult = (await publishedResponse.json()) as {
          rows?: PublishedContribution[];
        };
        const canonicalResult = (await canonicalResponse.json()) as {
          records?: CanonicalRecord[];
        };
        if (active && publishedResponse.ok) setRows(publishedResult.rows ?? []);
        if (active && canonicalResponse.ok) setCanonical(canonicalResult.records ?? []);
      } finally {
        if (active) setLoaded(true);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, []);
  return (
    <div className="publishedEvidence">
      <div className="publishedHead">
        <div>
          <p className="eyebrow">ÇAPRAZ DOĞRULANAN TOPLULUK KAYITLARI</p>
          <h3>Editör onaylı saha akışı</h3>
          <p>
            Burada yalnız bağımsız kanıtları kontrol edilmiş ve editör
            tarafından yayımlanmış güvenli alanlar görünür. İletişim bilgisi ve
            ham dosya yayımlanmaz.
          </p>
        </div>
        <span>{rows.length} yayımlanmış kayıt</span>
      </div>
      {loaded && rows.length === 0 ? (
        <div className="publishedEmpty">
          <i>◇</i>
          <span>
            <b>İlk çapraz doğrulanmış katkı bekleniyor</b>
            <small>
              Kuyruktaki kayıtlar editör onayından geçtikçe burada görünecek.
            </small>
          </span>
        </div>
      ) : (
        <div className="publishedGrid">
          {rows.map((row) => (
            <article key={row.id}>
              <header>
                <span>{kindNames[row.type]}</span>
                <b>ÇAPRAZ DOĞRULANDI</b>
              </header>
              <h4>{row.subject}</h4>
              <p>{row.server} · {row.observedAt}</p>
              <dl>
                {Object.entries(row.details)
                  .slice(0, 4)
                  .map(([key, value]) => (
                    <div key={key}>
                      <dt>{publicDetailLabel(key)}</dt>
                      <dd>{formatPublicValue(value)}</dd>
                    </div>
                  ))}
              </dl>
              <footer>{row.sourceCount} bağımsızlığı incelenmiş kanıt</footer>
            </article>
          ))}
        </div>
      )}
      <div className="canonicalPublic">
        <div>
          <span>ANA VERİ KATMANI · M8</span>
          <h4>Siteye işlenen doğrulanmış kayıtlar</h4>
          <p>
            Yalnız editörün fark önizlemesinden geçirip ana veriye uyguladığı
            sürümler burada görünür. Her değişiklik geri alınabilir.
          </p>
        </div>
        <b>{canonical.length} etkin kayıt</b>
      </div>
      {canonical.length > 0 && (
        <div className="canonicalGrid">
          {canonical.slice(0, 9).map((record) => (
            <article key={record.id}>
              <header>
                <span>{canonicalTypeLabel(record.entityType)}</span>
                <b>v{record.version}</b>
              </header>
              <h4>{record.displayName}</h4>
              <dl>
                {Object.entries(record.data)
                  .filter(([key]) => !["name", "verificationStatus", "provenance"].includes(key))
                  .slice(0, 4)
                  .map(([key, value]) => (
                    <div key={key}>
                      <dt>{publicDetailLabel(key)}</dt>
                      <dd>{formatPublicValue(value)}</dd>
                    </div>
                  ))}
              </dl>
              <footer>Çapraz doğrulandı · ana veriye işlendi</footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function canonicalTypeLabel(value: string) {
  return (
    {
      item: "EŞYA",
      mining_route: "MADEN ROTASI",
      market_observation: "PAZAR GÖZLEMİ",
      ability_media: "YETENEK",
    }[value] ?? value
  );
}

function publicDetailLabel(key: string) {
  const labels: Record<string, string> = {
    className: "Sınıf",
    slot: "Yuva",
    levelTier: "Seviye / kademe",
    acquisitionPlace: "Elde edilme",
    rarity: "Nadirlik",
    statLines: "Özellikler",
    appearanceProof: "Görünüş eşleşmesi",
    region: "Bölge",
    routeMinutes: "Tur süresi",
    nodeCount: "Damar",
    runCount: "Tur",
    yields: "Çıkanlar",
    boosters: "Arttırıcı",
    listingType: "Kayıt",
    quantity: "Miktar",
    currency: "Para",
    price: "Fiyat",
    channel: "Kanal",
    settledPrice: "Son fiyat",
    captureContext: "Ortam",
    abilityPoints: "Puan",
    server: "Sunucu",
    observedAt: "Gözlem",
    name: "Ad",
  };
  return labels[key] ?? key;
}

function formatPublicValue(value: unknown) {
  if (typeof value === "boolean") return value ? "Evet" : "Hayır";
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  ...inputProps
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">) {
  return (
    <label className="formField">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...inputProps}
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="formField">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  ...props
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">) {
  return (
    <label className="formField">
      <span>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
    </label>
  );
}

function Check({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="checkField">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
