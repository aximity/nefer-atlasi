export type PhotoIconReference = { name: string; src: string };
export type RecognizedInventoryItem = {
  name: string;
  quantity: number;
  confidence: number;
  quantityNeedsReview: boolean;
  nameNeedsReview: boolean;
};
export type PhotoRecognitionPhase = "prepare" | "grid" | "catalog" | "quantities" | "matching" | "finalize";
export type PhotoRecognitionProgress = { phase: PhotoRecognitionPhase; percent: number };
export type PhotoRecognitionOptions = {
  signal?: AbortSignal;
  onProgress?: (progress: PhotoRecognitionProgress) => void;
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
const referenceSignatureCache = new Map<string, Promise<Signature | null>>();
const yieldToBrowser = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new Error("Fotoğraf analizi süre sınırına ulaştı.");
}

function recognitionCandidateStatus(distance: number, gap: number, relativeGap: number, confidence: number) {
  if (distance > 0.22 || gap < 0.012 || relativeGap < 0.07 || confidence < 42) return "reject" as const;
  if (distance > 0.18 || gap < 0.024 || relativeGap < 0.14 || confidence < 58) return "review" as const;
  return "accept" as const;
}

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

function localProjectionPeak(scores: number[], position: number, tolerance = 3) {
  let peak = { position, score: scores[position] ?? 0 };
  for (let offset = -tolerance; offset <= tolerance; offset += 1) {
    const candidate = position + offset;
    if (candidate < 0 || candidate >= scores.length) continue;
    if ((scores[candidate] ?? 0) > peak.score) peak = { position: candidate, score: scores[candidate] };
  }
  return peak;
}

function extendAxis(positions: number[], scores: number[]) {
  if (positions.length < 2) return positions;
  const ordered = [...positions].sort((left, right) => left - right);
  const initialStrengths = ordered
    .map((position) => localProjectionPeak(scores, position).score)
    .sort((left, right) => left - right);
  const initialMedian = initialStrengths[Math.floor(initialStrengths.length / 2)] ?? 0;
  while (ordered.length > 2 && localProjectionPeak(scores, ordered[0]).score < initialMedian * 0.55) ordered.shift();
  while (ordered.length > 2 && localProjectionPeak(scores, ordered[ordered.length - 1]).score < initialMedian * 0.55) ordered.pop();
  const gaps = ordered.slice(1).map((position, index) => position - ordered[index]);
  const period = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
  const strengths = ordered
    .map((position) => localProjectionPeak(scores, position).score)
    .sort((left, right) => left - right);
  const medianStrength = strengths[Math.floor(strengths.length / 2)] ?? 0;
  const minimumStrength = medianStrength * 0.55;
  const extended = [...ordered];
  const before = localProjectionPeak(scores, Math.round(ordered[0] - period));
  if (before.position >= 0 && before.score >= minimumStrength) extended.unshift(before.position);
  const after = localProjectionPeak(scores, Math.round(ordered[ordered.length - 1] + period));
  if (after.position < scores.length && after.score >= minimumStrength) extended.push(after.position);
  return extended;
}

function gridShapeIsPlausible(grid: Grid) {
  const xGaps = grid.xs.slice(1).map((position, index) => position - grid.xs[index]);
  const yGaps = grid.ys.slice(1).map((position, index) => position - grid.ys[index]);
  const averageX = xGaps.reduce((sum, gap) => sum + gap, 0) / Math.max(1, xGaps.length);
  const averageY = yGaps.reduce((sum, gap) => sum + gap, 0) / Math.max(1, yGaps.length);
  const ratio = averageX / Math.max(1, averageY);
  return ratio >= 0.62 && ratio <= 1.62;
}

function gridFromProjections(columns: number[], rows: number[], edgeColumns: number[], edgeRows: number[]): Grid | null {
  const rhythmXRun = periodicLineRun(edgeColumns, 6);
  const rhythmYRun = periodicLineRun(edgeRows, 5);
  if (rhythmXRun && rhythmYRun) {
    const rhythmGrid = {
      xs: extendAxis(rhythmXRun.positions, edgeColumns),
      ys: extendAxis(rhythmYRun.positions, edgeRows),
    };
    if (gridShapeIsPlausible(rhythmGrid)) return rhythmGrid;
  }
  const edgeXRun = regularLineRun(edgeColumns, 6);
  const edgeYRun = regularLineRun(edgeRows, 5);
  if (edgeXRun && edgeYRun) {
    const edgeGrid = { xs: edgeXRun.positions, ys: edgeYRun.positions };
    if (gridShapeIsPlausible(edgeGrid)) return edgeGrid;
  }
  const xRun = regularLineRun(columns, 6);
  const yRun = regularLineRun(rows, 5);
  if (!xRun || !yRun) return null;
  const cyanGrid = { xs: xRun.positions, ys: yRun.positions };
  return gridShapeIsPlausible(cyanGrid) ? cyanGrid : null;
}

export const photoRecognitionTestInternals = { extendAxis, gridFromProjections, quantityMarkFromPixels, quantityFromPixels, recognitionCandidateStatus };

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
  const edges = edgeProjections(pixels, width, height);
  return gridFromProjections(columns, rows, edges.columns, edges.rows);
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

function quantityMarkFromPixels(pixels: Uint8ClampedArray, width: number, height: number) {
  let yellow = 0;
  const columns = new Set<number>();
  for (let y = Math.floor(height * 0.04); y < height * 0.46; y += 1) {
    for (let x = 0; x < width * 0.3; x += 1) {
      const offset = (y * width + x) * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      if (red < 65 || green < 55 || red + green - blue * 2 < 72 || Math.abs(red - green) > 58) continue;
      yellow += 1;
      columns.add(x);
    }
  }
  return yellow >= 20 && columns.size >= 3;
}

type QuantityRead = { quantity: number; confidence: number };
const quantityDigitTemplates: Record<string, readonly string[]> = {
  "0": ["1e01f8ffeffeffffffffffffffffffffffffffffffffeffeffcff0bc0180", "0201f81fc7fe7ffffffffffffdf7df7df7ff7ff3ff7feffeff88f0070000"],
  "1": ["0001801e0fe0fe0fe0fe07e07fc1fc7fc1fc7fc1fc7ffffffff7ff7ff040", "0000601e01e07f8ff87f81fc1fc1fc1fc1fc1fc1ff1ff1ff7ff7ff7ff1f8"],
  "2": ["3f07ff7ff7ff01f01f01f03f07f07f07f0ff3fe7fefffffd7fd7fdffc3c0", "000ff8fffffffff67f01f07f0ff0ff0ff7ff7ffffeffefffffeffeffeff0"],
  "3": ["0401e03fc7fe7fe1fe0fe1fe1fe1fe1fe1fe1feffffffffeffeffcffc7f0", "00c0fc3ff3ff1ff00f01f07f0ff0ff0ff0ff0ff3ff7fffffffffff7fc7f8"],
  "4": ["00400c01c03e07f07f0ff1ff1ff3ff3ff7ff7ffffffff7ff3ff07e03c01c"],
  "5": ["7fccfeffeffefecf80f807fe7ff3ff3ff03f07f07f3ff7ff7fe7fe7fe3f0", "7fcbfeffcffcf00f00facffc3fe7ff7ff07f07f0ff7ff7fe3fe3fe7fc7f0"],
  "6": ["0380f81fc7f87f87f8ff8ffcffeffeffefffffffffffffffffcffc1f0040"],
  "7": ["0087fc7fefffffffff8ff8ff0fe0fe1fc1fc1fc3f83e00e0000000000000"],
  "8": ["0f83fcffefffffffffffffffffffffffffffffffffffffffffeffe3fc100"],
  "9": ["f80fe0ff8ff8ffcfffffffffffffffffffffffcfffffcff8ff8ff8ff81c0", "7f0ff8ffcffcffeffeffeffeffefffffffffffeffc7fc7f87f03e03e01e0000"],
};
const QUANTITY_GLYPH_WIDTH = 12;
const QUANTITY_GLYPH_HEIGHT = 20;
const decodedQuantityTemplates = new Map<string, boolean[][]>();

function decodeQuantityTemplate(encoded: string) {
  const cached = decodedQuantityTemplates.get(encoded);
  if (cached) return cached;
  const bits = [...encoded].flatMap((value) => Number.parseInt(value, 16).toString(2).padStart(4, "0").split(""));
  const mask = Array.from({ length: QUANTITY_GLYPH_HEIGHT }, (_, y) =>
    Array.from({ length: QUANTITY_GLYPH_WIDTH }, (_, x) => bits[y * QUANTITY_GLYPH_WIDTH + x] === "1"),
  );
  decodedQuantityTemplates.set(encoded, mask);
  return mask;
}

function resizeBinaryMask(mask: boolean[][], targetWidth: number, targetHeight: number) {
  const sourceHeight = mask.length;
  const sourceWidth = mask[0]?.length ?? 0;
  if (!sourceWidth || !sourceHeight) return Array.from({ length: targetHeight }, () => Array<boolean>(targetWidth).fill(false));
  return Array.from({ length: targetHeight }, (_, y) =>
    Array.from({ length: targetWidth }, (_, x) => mask[Math.min(sourceHeight - 1, Math.floor(y * sourceHeight / targetHeight))][Math.min(sourceWidth - 1, Math.floor(x * sourceWidth / targetWidth))]),
  );
}

function shiftedMaskDistance(left: boolean[][], right: boolean[][]) {
  let best = 1;
  for (let shiftY = -1; shiftY <= 1; shiftY += 1) {
    for (let shiftX = -1; shiftX <= 1; shiftX += 1) {
      let union = 0;
      let difference = 0;
      for (let y = 0; y < QUANTITY_GLYPH_HEIGHT; y += 1) {
        for (let x = 0; x < QUANTITY_GLYPH_WIDTH; x += 1) {
          const rightY = y - shiftY;
          const rightX = x - shiftX;
          const a = left[y]?.[x] ?? false;
          const b = rightY >= 0 && rightY < QUANTITY_GLYPH_HEIGHT && rightX >= 0 && rightX < QUANTITY_GLYPH_WIDTH ? right[rightY][rightX] : false;
          if (a || b) union += 1;
          if (a !== b) difference += 1;
        }
      }
      best = Math.min(best, difference / Math.max(1, union));
    }
  }
  return best;
}

function quantityFromPixels(pixels: Uint8ClampedArray, width: number, height: number): QuantityRead | null {
  const regionWidth = Math.max(1, Math.floor(width * 0.7));
  const regionHeight = Math.max(1, Math.floor(height * 0.64));
  const yellow = Array.from({ length: regionHeight }, () => Array<boolean>(regionWidth).fill(false));
  for (let y = 0; y < regionHeight; y += 1) {
    for (let x = 0; x < regionWidth; x += 1) {
      const offset = (y * width + x) * 4;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      yellow[y][x] = red > 105 && green > 90 && blue < 155 && red + green - blue * 2 > 90 && Math.abs(red - green) < 105;
    }
  }
  const visited = Array.from({ length: regionHeight }, () => Array<boolean>(regionWidth).fill(false));
  const components: { area: number; minX: number; minY: number; maxX: number; maxY: number; points: [number, number][] }[] = [];
  for (let startY = 0; startY < regionHeight; startY += 1) {
    for (let startX = 0; startX < regionWidth; startX += 1) {
      if (!yellow[startY][startX] || visited[startY][startX]) continue;
      const queue: [number, number][] = [[startX, startY]];
      const points: [number, number][] = [];
      visited[startY][startX] = true;
      let minX = startX; let maxX = startX; let minY = startY; let maxY = startY;
      for (let index = 0; index < queue.length; index += 1) {
        const [x, y] = queue[index];
        points.push([x, y]);
        minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        for (const [nextX, nextY] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]] as const) {
          if (nextX < 0 || nextY < 0 || nextX >= regionWidth || nextY >= regionHeight || visited[nextY][nextX] || !yellow[nextY][nextX]) continue;
          visited[nextY][nextX] = true;
          queue.push([nextX, nextY]);
        }
      }
      const componentWidth = maxX - minX + 1;
      const componentHeight = maxY - minY + 1;
      if (points.length >= Math.max(12, width * height * 0.005) && minX <= width * 0.23 && minY <= height * 0.32 && componentWidth >= 4 && componentHeight >= height * 0.15) {
        components.push({ area: points.length, minX, minY, maxX, maxY, points });
      }
    }
  }
  const component = components.sort((left, right) => (right.maxX - right.minX) - (left.maxX - left.minX) || right.area - left.area)[0];
  if (!component) return null;
  const componentWidth = component.maxX - component.minX + 1;
  const componentHeight = component.maxY - component.minY + 1;
  const mask = Array.from({ length: componentHeight }, () => Array<boolean>(componentWidth).fill(false));
  for (const [x, y] of component.points) mask[y - component.minY][x - component.minX] = true;
  const ratio = componentWidth / Math.max(1, componentHeight);
  const digitCount = ratio < 0.9 ? 1 : ratio < 1.52 ? 2 : 3;
  const projection = Array.from({ length: componentWidth }, (_, x) => mask.reduce((sum, row) => sum + Number(row[x]), 0));
  const boundaries = [0];
  for (let digit = 1; digit < digitCount; digit += 1) {
    const target = componentWidth * digit / digitCount;
    const low = Math.max(boundaries[boundaries.length - 1] + 2, Math.floor(componentWidth * (digit / digitCount - 0.16 / digitCount)));
    const high = Math.min(componentWidth - 2, Math.ceil(componentWidth * (digit / digitCount + 0.16 / digitCount)));
    let best = low;
    let bestScore = Number.POSITIVE_INFINITY;
    for (let x = low; x <= high; x += 1) {
      const score = (projection[x - 1] ?? 0) + projection[x] + (projection[x + 1] ?? 0) + Math.abs(x - target) * 0.05;
      if (score < bestScore) { best = x; bestScore = score; }
    }
    boundaries.push(best);
  }
  boundaries.push(componentWidth);
  const digits: string[] = [];
  const confidences: number[] = [];
  for (let digit = 0; digit < digitCount; digit += 1) {
    const start = boundaries[digit];
    const end = boundaries[digit + 1];
    const normalized = resizeBinaryMask(mask.map((row) => row.slice(start, end)), QUANTITY_GLYPH_WIDTH, QUANTITY_GLYPH_HEIGHT);
    const matches = Object.entries(quantityDigitTemplates).map(([value, templates]) => ({
      value,
      distance: Math.min(...templates.map((template) => shiftedMaskDistance(normalized, decodeQuantityTemplate(template)))),
    })).sort((left, right) => left.distance - right.distance);
    if (!matches[0]) return null;
    digits.push(matches[0].value);
    const gap = (matches[1]?.distance ?? 1) - matches[0].distance;
    confidences.push(clamp((0.72 - matches[0].distance) / 0.42 + gap * 1.8));
  }
  const quantity = Number(digits.join(""));
  if (!Number.isInteger(quantity) || quantity < 2 || quantity > 999) return null;
  return { quantity, confidence: Math.min(...confidences) };
}

function cellHasQuantityMark(context: CanvasRenderingContext2D, width: number, height: number) {
  return quantityMarkFromPixels(context.getImageData(0, 0, width, height).data, width, height);
}

function fallbackQuantity(context: CanvasRenderingContext2D, width: number, height: number) {
  return quantityFromPixels(context.getImageData(0, 0, width, height).data, width, height);
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

function cachedReferenceSignature(reference: PhotoIconReference) {
  const cached = referenceSignatureCache.get(reference.src);
  if (cached) return cached;
  const pending = (async () => {
    try {
      const image = await loadImage(reference.src);
      const canvas = document.createElement("canvas");
      canvas.width = 14;
      canvas.height = 14;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      return context ? signatureFor(context, image, image.naturalWidth, image.naturalHeight) : null;
    } catch {
      return null;
    }
  })();
  referenceSignatureCache.set(reference.src, pending);
  return pending;
}

export async function recognizeInventoryPhoto(file: File, references: PhotoIconReference[], options: PhotoRecognitionOptions = {}): Promise<InventoryRecognitionResult> {
  const progress = (phase: PhotoRecognitionPhase, percent: number) => options.onProgress?.({ phase, percent });
  assertNotAborted(options.signal);
  progress("prepare", 4);
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
  assertNotAborted(options.signal);
  progress("grid", 18);
  await yieldToBrowser();
  const detectedGrid = detectGrid(canvas);
  if (!detectedGrid) throw new Error("Görüntü net, ancak çanta düzenini güvenle ayıramadım. Fotoğrafı değiştirmene gerek yok; bu örneğin ızgara biçimi için algılama desteği gerekiyor.");
  assertNotAborted(options.signal);
  progress("catalog", 38);
  await yieldToBrowser();

  const signatureCanvas = document.createElement("canvas");
  signatureCanvas.width = 14;
  signatureCanvas.height = 14;
  const signatureContext = signatureCanvas.getContext("2d", { willReadFrequently: true });
  if (!signatureContext) throw new Error("İkon karşılaştırması başlatılamadı.");
  const loadedReferences = (await Promise.all(references.map(async (reference) => {
    const signature = await cachedReferenceSignature(reference);
    return signature ? { ...reference, signature } : null;
  }))).filter((reference): reference is LoadedReference => Boolean(reference));
  if (!loadedReferences.length) throw new Error("Malzeme ikon kataloğu yüklenemedi.");
  assertNotAborted(options.signal);

  const grid = detectedGrid;
  progress("quantities", 56);
  const quantities = await detectQuantities(canvas, grid);
  assertNotAborted(options.signal);
  progress("matching", 62);
  const recognized: RecognizedInventoryItem[] = [];
  let detectedSlots = 0;
  for (let row = 0; row < grid.ys.length - 1; row += 1) {
    assertNotAborted(options.signal);
    if (row > 0) await yieldToBrowser();
    progress("matching", 62 + Math.round((row / Math.max(1, grid.ys.length - 1)) * 30));
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
      if (!best || !second) continue;
      const gap = (second?.distance ?? 0.5) - best.distance;
      const relativeGap = gap / Math.max(0.001, best.distance);
      // Monitor photos shift hue and brightness, so absolute distance alone is
      // pessimistic. Admit only candidates that also beat the runner-up by a
      // material margin; visually shared metal/gem families remain excluded.
      const confidence = Math.round(clamp(0.45 + (0.19 - best.distance) * 1.5 + gap * 5 + relativeGap * 0.25, 0, 0.94) * 100);
      const candidateStatus = recognitionCandidateStatus(best.distance, gap, relativeGap, confidence);
      if (candidateStatus === "reject") continue;
      const nativeQuantity = quantities.get(`${column}:${row}`);
      const quantityMark = cellHasQuantityMark(cellContext, width, height);
      const localQuantity = nativeQuantity === undefined && quantityMark ? fallbackQuantity(cellContext, width, height) : null;
      const detectedQuantity = nativeQuantity ?? localQuantity?.quantity;
      const quantityNeedsReview = quantityMark && (detectedQuantity === undefined || (localQuantity?.confidence ?? 1) < 0.42);
      // İKV one-item stacks have no yellow amount label. A visible yellow label
      // that OCR could not read is unknown, never an invented quantity of one.
      const quantity = detectedQuantity ?? (quantityMark ? 0 : 1);
      recognized.push({ name: best.reference.name, quantity, confidence, quantityNeedsReview, nameNeedsReview: candidateStatus === "review" });
    }
  }

  const merged = new Map<string, RecognizedInventoryItem>();
  for (const item of recognized) {
    const current = merged.get(item.name);
    if (!current) merged.set(item.name, item);
    else merged.set(item.name, {
      ...current,
      quantity: current.quantityNeedsReview || item.quantityNeedsReview ? 0 : current.quantity + item.quantity,
      confidence: Math.min(current.confidence, item.confidence),
      quantityNeedsReview: current.quantityNeedsReview || item.quantityNeedsReview,
      nameNeedsReview: current.nameNeedsReview || item.nameNeedsReview,
    });
  }
  progress("finalize", 96);
  const items = [...merged.values()].sort((left, right) => right.confidence - left.confidence || left.name.localeCompare(right.name, "tr"));
  if (!items.length) throw new Error("Izgarayı gördüm ancak ikonları birbirinden yeterli güvenle ayıramadım. Yanlış malzeme önermemek için onay taslağı oluşturmadım.");
  const warnings: string[] = [];
  if (items.some((item) => item.nameNeedsReview)) warnings.push("Bazı ikonlar düşük güvenli aday olarak gösterildi; adını onaylamadan stoka işlenemez.");
  if (items.some((item) => item.quantityNeedsReview)) warnings.push("Bazı adetler bu tarayıcıda güvenle okunamadı; yanlış stok oluşturmamak için boş bırakıldı.");
  if (detectedSlots > items.length) warnings.push(`${detectedSlots - items.length} dolu yuva düşük güven nedeniyle taslağa eklenmedi.`);
  progress("finalize", 100);
  return { items, detectedSlots, warnings };
}
