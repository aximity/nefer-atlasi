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
type LoadedReference = PhotoIconReference & { signature: Signature };
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
  const threshold = Math.max(4, high * 0.45);
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
  const allPeaks = clusteredPeaks(scores);
  const peaks = (allPeaks.length > 90 ? [...allPeaks].sort((left, right) => right.score - left.score).slice(0, 90) : allPeaks)
    .sort((left, right) => left.position - right.position);
  let best: LineRun | null = null;
  const nearestPeak = (expected: number) => {
    let low = 0;
    let high = peaks.length - 1;
    while (low <= high) {
      const middle = (low + high) >> 1;
      if (peaks[middle].position < expected) low = middle + 1;
      else high = middle - 1;
    }
    const candidates = [peaks[low], peaks[low - 1]].filter((peak): peak is (typeof peaks)[number] => Boolean(peak));
    return candidates.reduce<{ peak: (typeof peaks)[number] | null; distance: number }>((current, peak) => {
      const distance = Math.abs(peak.position - expected);
      return distance < current.distance ? { peak, distance } : current;
    }, { peak: null, distance: Number.POSITIVE_INFINITY });
  };
  const evaluate = (positions: number[], strength: number, residual: number) => {
    if (positions.length < minimumLines) return;
    const gaps = positions.slice(1).map((position, index) => position - positions[index]);
    const average = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    if (average < 9 || average > 90) return;
    const deviation = Math.sqrt(gaps.reduce((sum, gap) => sum + (gap - average) ** 2, 0) / gaps.length);
    if (deviation / average > 0.24) return;
    const score = positions.length * strength * (1 - deviation / average) / (1 + residual);
    if (!best || score > best.score) best = { positions, score };
  };

  // Grid lines can contain extra highlights from circular icons. Fit a regular
  // sequence through all peaks instead of requiring the useful peaks to be
  // adjacent in the projection list.
  for (let leftIndex = 0; leftIndex < peaks.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < peaks.length; rightIndex += 1) {
      const span = peaks[rightIndex].position - peaks[leftIndex].position;
      for (let steps = 1; steps <= Math.min(12, Math.floor(span / 9)); steps += 1) {
        const period = span / steps;
        if (period < 9 || period > 90) continue;
        const tolerance = Math.max(2, period * 0.16);
        let run: typeof peaks = [];
        const commit = () => {
          if (run.length >= minimumLines) {
            const positions = run.map((peak) => peak.position);
            const strength = run.reduce((sum, peak) => sum + peak.score, 0) / run.length;
            const residual = run.reduce((sum, peak, index) => sum + Math.abs((positions[0] + index * period) - peak.position), 0) / run.length;
            evaluate(positions, strength, residual);
          }
          run = [];
        };
        const firstStep = Math.floor((0 - peaks[leftIndex].position) / period) - 1;
        const lastStep = Math.ceil((scores.length - peaks[leftIndex].position) / period) + 1;
        for (let step = firstStep; step <= lastStep; step += 1) {
          const expected = peaks[leftIndex].position + step * period;
          const nearest = nearestPeak(expected);
          if (nearest.peak && nearest.distance <= tolerance && !run.some((peak) => peak.position === nearest.peak?.position)) run.push(nearest.peak);
          else commit();
        }
        commit();
      }
    }
  }
  return best;
}

function edgeProjections(pixels: Uint8ClampedArray, width: number, height: number) {
  const columns = Array.from({ length: width }, () => 0);
  const rows = Array.from({ length: height }, () => 0);
  const light = (offset: number) => pixels[offset] * 0.299 + pixels[offset + 1] * 0.587 + pixels[offset + 2] * 0.114;
  for (let y = 2; y < height - 2; y += 2) {
    for (let x = 2; x < width - 2; x += 2) {
      const offset = (y * width + x) * 4;
      const horizontal = Math.abs(light(offset + 8) - light(offset - 8));
      const vertical = Math.abs(light(offset + width * 8) - light(offset - width * 8));
      if (horizontal > 18) columns[x] += horizontal;
      if (vertical > 18) rows[y] += vertical;
    }
  }
  for (let index = 1; index < columns.length; index += 2) columns[index] = (columns[index - 1] + (columns[index + 1] ?? columns[index - 1])) / 2;
  for (let index = 1; index < rows.length; index += 2) rows[index] = (rows[index - 1] + (rows[index + 1] ?? rows[index - 1])) / 2;
  return { columns, rows };
}

function periodicLineRun(scores: number[], minimumLines: number): LineRun | null {
  const sorted = [...scores].sort((a, b) => a - b);
  const baseline = sorted[Math.floor(sorted.length * 0.55)] ?? 0;
  const strong = sorted[Math.floor(sorted.length * 0.88)] ?? baseline;
  let best: LineRun | null = null;
  const localPeak = (position: number) => {
    let peak = { position, score: scores[position] ?? 0 };
    for (let offset = -3; offset <= 3; offset += 1) {
      const candidate = position + offset;
      if ((scores[candidate] ?? 0) > peak.score) peak = { position: candidate, score: scores[candidate] };
    }
    return peak;
  };

  // Screenshots often soften or cover individual separators, while the cell
  // spacing remains highly regular. Search the projection directly for that
  // repeated rhythm so one weak line (or a tooltip) cannot reject the photo.
  for (let period = 18; period <= 90; period += 1) {
    for (let phase = 0; phase < period; phase += 1) {
      const sequence: { position: number; score: number }[] = [];
      for (let position = phase; position < scores.length; position += period) sequence.push(localPeak(position));
      for (let start = 0; start <= sequence.length - minimumLines; start += 1) {
        for (let length = minimumLines; length <= Math.min(12, sequence.length - start); length += 1) {
          const window = sequence.slice(start, start + length);
          if (new Set(window.map((entry) => entry.position)).size !== window.length) continue;
          const strongCount = window.filter((entry) => entry.score >= strong).length;
          if (strongCount < Math.ceil(length * 0.45)) continue;
          const average = window.reduce((sum, entry) => sum + Math.max(0, entry.score - baseline), 0) / length;
          const score = average * length * (strongCount / length) ** 2;
          if (!best || score > best.score) best = { positions: window.map((entry) => entry.position), score };
        }
      }
    }
  }
  return best;
}

function gridShapeIsPlausible(grid: Grid) {
  const xGaps = grid.xs.slice(1).map((position, index) => position - grid.xs[index]);
  const yGaps = grid.ys.slice(1).map((position, index) => position - grid.ys[index]);
  const averageX = xGaps.reduce((sum, gap) => sum + gap, 0) / Math.max(1, xGaps.length);
  const averageY = yGaps.reduce((sum, gap) => sum + gap, 0) / Math.max(1, yGaps.length);
  const ratio = averageX / Math.max(1, averageY);
  return ratio >= 0.62 && ratio <= 1.62;
}

function axisAlignmentCandidates(positions: number[], limit: number) {
  const gaps = positions.slice(1).map((position, index) => position - positions[index]);
  const average = gaps.reduce((sum, gap) => sum + gap, 0) / Math.max(1, gaps.length);
  const candidates = [-0.5, -0.25, 0, 0.25, 0.5]
    .map((fraction) => positions.map((position) => Math.round(position + average * fraction)))
    .filter((axis) => axis[0] >= 0 && axis[axis.length - 1] <= limit);
  const centerBoundaries = [
    Math.round(positions[0] - average / 2),
    ...positions.slice(1).map((position, index) => Math.round((positions[index] + position) / 2)),
    Math.round(positions[positions.length - 1] + average / 2),
  ];
  if (centerBoundaries[0] >= 0 && centerBoundaries[centerBoundaries.length - 1] <= limit) candidates.push(centerBoundaries);
  return candidates.filter((axis, index) => candidates.findIndex((candidate) => candidate.join(":") === axis.join(":")) === index);
}

function gridAlignmentScore(
  canvas: HTMLCanvasElement,
  grid: Grid,
  signatureContext: CanvasRenderingContext2D,
  references: LoadedReference[],
) {
  let score = 0;
  let compared = 0;
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
      const signature = signatureFor(signatureContext, cell, width, height);
      const distances = references.map((reference) => signatureDistance(signature, reference.signature)).sort((left, right) => left - right);
      if (distances.length < 2) continue;
      const best = distances[0];
      const gap = distances[1] - best;
      score += Math.max(0, 0.25 - best) + Math.max(0, gap) * 1.8;
      compared += 1;
    }
  }
  return compared ? score / Math.sqrt(compared) : 0;
}

function alignGrid(
  canvas: HTMLCanvasElement,
  detected: Grid,
  signatureContext: CanvasRenderingContext2D,
  references: LoadedReference[],
) {
  const xCandidates = axisAlignmentCandidates(detected.xs, canvas.width);
  const yCandidates = axisAlignmentCandidates(detected.ys, canvas.height);
  let best = detected;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const xs of xCandidates) {
    for (const ys of yCandidates) {
      const candidate = { xs, ys };
      if (!gridShapeIsPlausible(candidate)) continue;
      const score = gridAlignmentScore(canvas, candidate, signatureContext, references);
      if (score > bestScore) {
        best = candidate;
        bestScore = score;
      }
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
  if (xRun && yRun) {
    const cyanGrid = { xs: xRun.positions, ys: yRun.positions };
    if (gridShapeIsPlausible(cyanGrid)) return cyanGrid;
  }
  const edges = edgeProjections(pixels, width, height);
  const edgeXRun = regularLineRun(edges.columns, 6);
  const edgeYRun = regularLineRun(edges.rows, 5);
  if (edgeXRun && edgeYRun) {
    const edgeGrid = { xs: edgeXRun.positions, ys: edgeYRun.positions };
    if (gridShapeIsPlausible(edgeGrid)) return edgeGrid;
  }
  const rhythmXRun = periodicLineRun(edges.columns, 6);
  const rhythmYRun = periodicLineRun(edges.rows, 5);
  if (!rhythmXRun || !rhythmYRun) return null;
  const rhythmGrid = { xs: rhythmXRun.positions, ys: rhythmYRun.positions };
  return gridShapeIsPlausible(rhythmGrid) ? rhythmGrid : null;
}

function signatureFor(
  context: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  offsetX = 0,
  offsetY = 0,
): Signature {
  const size = 14;
  context.clearRect(0, 0, size, size);
  const insetX = sourceWidth * 0.12;
  const insetY = sourceHeight * 0.12;
  const cropWidth = sourceWidth - insetX * 2;
  const cropHeight = sourceHeight - insetY * 2;
  context.drawImage(source, insetX + sourceWidth * offsetX, insetY + sourceHeight * offsetY, cropWidth, cropHeight, 0, 0, size, size);
  const pixels = context.getImageData(0, 0, size, size).data;
  const signature: number[] = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (x + 0.5 - size / 2) / (size / 2);
      const dy = (y + 0.5 - size / 2) / (size / 2);
      // Quantity text sits over the icon's upper-left rim. Compare only the
      // stable circular core so yellow digits and grid borders cannot become
      // part of the material fingerprint.
      if (dx * dx + dy * dy > 0.52) continue;
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
      const raw = String(detection.rawValue ?? "").trim();
      if (!/^\d{1,4}$/.test(raw)) continue;
      const amount = Number(raw);
      const box = detection.boundingBox;
      if (!box || !Number.isInteger(amount) || amount < 1 || amount > 9999) continue;
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      const column = grid.xs.findIndex((line, index) => index < grid.xs.length - 1 && centerX >= line && centerX <= grid.xs[index + 1]);
      const row = grid.ys.findIndex((line, index) => index < grid.ys.length - 1 && centerY >= line && centerY <= grid.ys[index + 1]);
      if (column < 0 || row < 0) continue;
      const left = grid.xs[column];
      const top = grid.ys[row];
      const width = grid.xs[column + 1] - left;
      const height = grid.ys[row + 1] - top;
      // Inventory amounts are printed in the upper-left corner. Reject digits
      // from icons, tooltips and the rest of the game UI.
      if (centerX > left + width * 0.48 || centerY > top + height * 0.42) continue;
      if (box.width > width * 0.48 || box.height > height * 0.42) continue;
      quantities.set(`${column}:${row}`, amount);
    }
  } catch {
    return new Map<string, number>();
  }
  return quantities;
}

export async function recognizeInventoryPhoto(file: File, references: PhotoIconReference[]): Promise<InventoryRecognitionResult> {
  if (!file.type.startsWith("image/")) throw new Error("PNG, JPG veya WebP biçiminde bir çanta görüntüsü seç.");
  if (file.size > 12 * 1024 * 1024) throw new Error("Fotoğraf 12 MB sınırını aşıyor.");
  let source: ImageBitmap | HTMLImageElement;
  let sourceUrl = "";
  try {
    source = await createImageBitmap(file);
  } catch {
    sourceUrl = URL.createObjectURL(file);
    source = await loadImage(sourceUrl);
  }
  const maximum = 1400;
  const sourceWidth = source instanceof ImageBitmap ? source.width : source.naturalWidth;
  const sourceHeight = source instanceof ImageBitmap ? source.height : source.naturalHeight;
  const scale = Math.min(1, maximum / Math.max(sourceWidth, sourceHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sourceWidth * scale));
  canvas.height = Math.max(1, Math.round(sourceHeight * scale));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Bu tarayıcı fotoğraf analizini başlatamadı.");
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  if (source instanceof ImageBitmap) source.close();
  if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  const detectedGrid = detectGrid(canvas);
  if (!detectedGrid) throw new Error("Görüntü net, ancak çanta düzenini güvenle ayıramadım. Fotoğrafı değiştirmene gerek yok; bu örneğin ızgara biçimi için algılama desteği gerekiyor.");

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
  }))).filter((reference): reference is LoadedReference => Boolean(reference));
  if (!loadedReferences.length) throw new Error("Malzeme ikon kataloğu yüklenemedi.");

  const grid = alignGrid(canvas, detectedGrid, signatureContext, loadedReferences);
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
      const signatures = [-0.06, 0, 0.06].flatMap((offsetY) =>
        [-0.06, 0, 0.06].map((offsetX) => signatureFor(signatureContext, cell, width, height, offsetX, offsetY)),
      );
      const matches = loadedReferences
        .map((reference) => ({
          reference,
          distance: Math.min(...signatures.map((signature) => signatureDistance(signature, reference.signature))),
        }))
        .sort((left, right) => left.distance - right.distance);
      const best = matches[0];
      const second = matches[1];
      if (!best || !second || best.distance > 0.2) continue;
      const gap = (second?.distance ?? 0.5) - best.distance;
      if (gap < 0.015 || second.distance < best.distance * 1.08) continue;
      const confidence = Math.round(clamp((0.22 - best.distance) * 4.2 + gap * 3.2, 0, 0.98) * 100);
      if (confidence < 58) continue;
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
  if (!items.length) throw new Error("Izgarayı gördüm ancak ikonları birbirinden yeterli güvenle ayıramadım. Yanlış malzeme önermemek için onay taslağı oluşturmadım.");
  const warnings: string[] = [];
  if (items.some((item) => item.quantityNeedsReview)) warnings.push("Bazı adetler görüntüden okunamadı; 1 olarak işaretlenenleri onaylamadan önce kontrol et.");
  if (detectedSlots > items.length) warnings.push(`${detectedSlots - items.length} dolu yuva düşük güven nedeniyle taslağa eklenmedi.`);
  return { items, detectedSlots, warnings };
}
