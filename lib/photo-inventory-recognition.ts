export type PhotoIconReference = { name: string; src: string };
export type RecognizedInventoryItem = {
  name: string;
  quantity: number;
  confidence: number;
  quantityNeedsReview: boolean;
};
export type InventoryRecognitionResult = {
  items: RecognizedInventoryItem[];
  detectedSlots: number;
  warnings: string[];
};

type LineRun = { positions: number[]; score: number };
type Grid = { xs: number[]; ys: number[] };
type Signature = number[];
type TextDetection = { rawValue?: string; boundingBox?: DOMRectReadOnly };
type TextDetectorLike = { detect(source: CanvasImageSource): Promise<TextDetection[]> };
type TextDetectorConstructor = new () => TextDetectorLike;

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Referans ikonu okunamadı."));
    image.src = src;
  });
}

function cyanPixel(red: number, green: number, blue: number) {
  return blue > 90 && green > 55 && blue - red > 24 && green + blue > red * 2.05;
}

function clusteredPeaks(scores: number[]) {
  const sorted = [...scores].sort((a, b) => a - b);
  const high = sorted[Math.floor(sorted.length * 0.965)] ?? 0;
  const threshold = Math.max(5, high * 0.72);
  const peaks: { position: number; score: number }[] = [];
  let start = -1;
  let weighted = 0;
  let total = 0;
  for (let index = 0; index <= scores.length; index += 1) {
    const value = scores[index] ?? 0;
    if (value >= threshold) {
      if (start < 0) start = index;
      weighted += index * value;
      total += value;
    } else if (start >= 0) {
      peaks.push({ position: Math.round(weighted / Math.max(1, total)), score: total / Math.max(1, index - start) });
      start = -1;
      weighted = 0;
      total = 0;
    }
  }
  return peaks;
}

function regularLineRun(scores: number[], minimumLines: number): LineRun | null {
  const peaks = clusteredPeaks(scores);
  let best: LineRun | null = null;
  for (let start = 0; start < peaks.length; start += 1) {
    for (let end = start + minimumLines - 1; end < peaks.length; end += 1) {
      const selected = peaks.slice(start, end + 1);
      const gaps = selected.slice(1).map((peak, index) => peak.position - selected[index].position);
      if (gaps.some((gap) => gap < 9 || gap > 90)) break;
      const average = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
      const deviation = Math.sqrt(gaps.reduce((sum, gap) => sum + (gap - average) ** 2, 0) / gaps.length);
      if (deviation / average > 0.22) continue;
      const lineStrength = selected.reduce((sum, peak) => sum + peak.score, 0) / selected.length;
      const score = selected.length * lineStrength * (1 - deviation / average);
      if (!best || score > best.score) best = { positions: selected.map((peak) => peak.position), score };
    }
  }
  return best;
}

function detectGrid(canvas: HTMLCanvasElement): Grid | null {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  const { width, height } = canvas;
  const pixels = context.getImageData(0, 0, width, height).data;
  const columns = Array.from({ length: width }, () => 0);
  const rows = Array.from({ length: height }, () => 0);
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const offset = (y * width + x) * 4;
      if (!cyanPixel(pixels[offset], pixels[offset + 1], pixels[offset + 2])) continue;
      columns[x] += 1;
      rows[y] += 1;
    }
  }
  for (let index = 1; index < columns.length; index += 2) columns[index] = (columns[index - 1] + (columns[index + 1] ?? columns[index - 1])) / 2;
  for (let index = 1; index < rows.length; index += 2) rows[index] = (rows[index - 1] + (rows[index + 1] ?? rows[index - 1])) / 2;
  const xRun = regularLineRun(columns, 6);
  const yRun = regularLineRun(rows, 5);
  if (!xRun || !yRun) return null;
  return { xs: xRun.positions, ys: yRun.positions };
}

function signatureFor(context: CanvasRenderingContext2D, source: CanvasImageSource, sourceWidth: number, sourceHeight: number): Signature {
  const size = 14;
  context.clearRect(0, 0, size, size);
  const insetX = sourceWidth * 0.08;
  const insetY = sourceHeight * 0.08;
  context.drawImage(source, insetX, insetY, sourceWidth - insetX * 2, sourceHeight - insetY * 2, 0, 0, size, size);
  const pixels = context.getImageData(0, 0, size, size).data;
  const signature: number[] = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x + 0.5 - size / 2) / (size / 2);
      const dy = (y + 0.5 - size / 2) / (size / 2);
      if (dx * dx + dy * dy > 0.94) continue;
      const offset = (y * size + x) * 4;
      const red = pixels[offset] / 255;
      const green = pixels[offset + 1] / 255;
      const blue = pixels[offset + 2] / 255;
      const max = Math.max(red, green, blue);
      const min = Math.min(red, green, blue);
      const saturation = max ? (max - min) / max : 0;
      signature.push(red, green, blue, saturation, max);
    }
  }
  return signature;
}

function signatureDistance(left: Signature, right: Signature) {
  const length = Math.min(left.length, right.length);
  let distance = 0;
  for (let index = 0; index < length; index += 1) distance += Math.abs(left[index] - right[index]);
  return distance / Math.max(1, length);
}

function cellHasIcon(context: CanvasRenderingContext2D, width: number, height: number) {
  const pixels = context.getImageData(0, 0, width, height).data;
  let mean = 0;
  let meanSquare = 0;
  let colorful = 0;
  let count = 0;
  for (let y = Math.floor(height * 0.18); y < height * 0.82; y += 2) {
    for (let x = Math.floor(width * 0.18); x < width * 0.82; x += 2) {
      const offset = (y * width + x) * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const light = (red + green + blue) / 3;
      mean += light;
      meanSquare += light * light;
      if (Math.max(red, green, blue) - Math.min(red, green, blue) > 34) colorful += 1;
      count += 1;
    }
  }
  mean /= Math.max(1, count);
  const deviation = Math.sqrt(Math.max(0, meanSquare / Math.max(1, count) - mean * mean));
  return deviation > 19 || colorful / Math.max(1, count) > 0.12;
}

async function detectQuantities(canvas: HTMLCanvasElement, grid: Grid) {
  const Detector = (window as typeof window & { TextDetector?: TextDetectorConstructor }).TextDetector;
  const quantities = new Map<string, number>();
  if (!Detector) return quantities;
  try {
    const detections = await new Detector().detect(canvas);
    for (const detection of detections) {
      const amount = Number(String(detection.rawValue ?? "").replace(/\D/g, ""));
      const box = detection.boundingBox;
      if (!box || !Number.isInteger(amount) || amount < 1 || amount > 9999) continue;
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      const column = grid.xs.findIndex((line, index) => index < grid.xs.length - 1 && centerX >= line && centerX <= grid.xs[index + 1]);
      const row = grid.ys.findIndex((line, index) => index < grid.ys.length - 1 && centerY >= line && centerY <= grid.ys[index + 1]);
      if (column >= 0 && row >= 0) quantities.set(`${column}:${row}`, amount);
    }
  } catch {
    return new Map<string, number>();
  }
  return quantities;
}

export async function recognizeInventoryPhoto(file: File, references: PhotoIconReference[]): Promise<InventoryRecognitionResult> {
  if (!file.type.startsWith("image/")) throw new Error("PNG, JPG veya WebP biçiminde bir çanta görüntüsü seç.");
  if (file.size > 12 * 1024 * 1024) throw new Error("Fotoğraf 12 MB sınırını aşıyor.");
  const bitmap = await createImageBitmap(file);
  const maximum = 1400;
  const scale = Math.min(1, maximum / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Bu tarayıcı fotoğraf analizini başlatamadı.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const grid = detectGrid(canvas);
  if (!grid) throw new Error("Çanta ızgarasını bulamadım. Envanter açıkken ekranı mümkün olduğunca düz ve net çekip tekrar dene.");

  const signatureCanvas = document.createElement("canvas");
  signatureCanvas.width = 14;
  signatureCanvas.height = 14;
  const signatureContext = signatureCanvas.getContext("2d", { willReadFrequently: true });
  if (!signatureContext) throw new Error("İkon karşılaştırması başlatılamadı.");
  const loadedReferences = (await Promise.all(references.map(async (reference) => {
    try {
      const image = await loadImage(reference.src);
      return { ...reference, signature: signatureFor(signatureContext, image, image.naturalWidth, image.naturalHeight) };
    } catch {
      return null;
    }
  }))).filter((reference): reference is PhotoIconReference & { signature: Signature } => Boolean(reference));
  if (!loadedReferences.length) throw new Error("Malzeme ikon kataloğu yüklenemedi.");

  const quantities = await detectQuantities(canvas, grid);
  const recognized: RecognizedInventoryItem[] = [];
  let detectedSlots = 0;
  for (let row = 0; row < grid.ys.length - 1; row += 1) {
    for (let column = 0; column < grid.xs.length - 1; column += 1) {
      const x = grid.xs[column];
      const y = grid.ys[row];
      const width = grid.xs[column + 1] - x;
      const height = grid.ys[row + 1] - y;
      if (width < 8 || height < 8) continue;
      const cell = document.createElement("canvas");
      cell.width = width;
      cell.height = height;
      const cellContext = cell.getContext("2d", { willReadFrequently: true });
      if (!cellContext) continue;
      cellContext.drawImage(canvas, x, y, width, height, 0, 0, width, height);
      if (!cellHasIcon(cellContext, width, height)) continue;
      detectedSlots += 1;
      const signature = signatureFor(signatureContext, cell, width, height);
      const matches = loadedReferences
        .map((reference) => ({ reference, distance: signatureDistance(signature, reference.signature) }))
        .sort((left, right) => left.distance - right.distance);
      const best = matches[0];
      const second = matches[1];
      if (!best || best.distance > 0.255) continue;
      const gap = (second?.distance ?? 0.5) - best.distance;
      const confidence = Math.round(clamp((0.28 - best.distance) * 3.1 + gap * 2.2, 0.45, 0.98) * 100);
      const quantity = quantities.get(`${column}:${row}`) ?? 1;
      recognized.push({ name: best.reference.name, quantity, confidence, quantityNeedsReview: !quantities.has(`${column}:${row}`) });
    }
  }

  const merged = new Map<string, RecognizedInventoryItem>();
  for (const item of recognized) {
    const current = merged.get(item.name);
    if (!current) merged.set(item.name, item);
    else merged.set(item.name, {
      ...current,
      quantity: current.quantity + item.quantity,
      confidence: Math.min(current.confidence, item.confidence),
      quantityNeedsReview: current.quantityNeedsReview || item.quantityNeedsReview,
    });
  }
  const items = [...merged.values()].sort((left, right) => right.confidence - left.confidence || left.name.localeCompare(right.name, "tr"));
  if (!items.length) throw new Error("Izgarayı gördüm ancak güvenle eşleşen malzeme bulamadım. Daha yakın ve net bir görüntüyle tekrar dene.");
  const warnings: string[] = [];
  if (items.some((item) => item.quantityNeedsReview)) warnings.push("Bazı adetler görüntüden okunamadı; 1 olarak işaretlenenleri onaylamadan önce kontrol et.");
  if (detectedSlots > items.length) warnings.push(`${detectedSlots - items.length} dolu yuva düşük güven nedeniyle taslağa eklenmedi.`);
  return { items, detectedSlots, warnings };
}
