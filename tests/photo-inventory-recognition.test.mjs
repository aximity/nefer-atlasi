import test from "node:test";
import assert from "node:assert/strict";
import { photoRecognitionTestInternals } from "../lib/photo-inventory-recognition.ts";

const projection = (length, positions, strength = 100) => {
  const scores = Array.from({ length }, () => 0);
  for (const position of positions) scores[position] = strength;
  return scores;
};

test("extends one weak terminal grid line without inventing a weak outer line", () => {
  const scores = projection(820, [244, 306, 366, 424, 484, 550, 610, 666]);
  scores[726] = 66;
  scores[184] = 46;
  assert.deepEqual(photoRecognitionTestInternals.extendAxis([244, 306, 366, 424, 484, 550, 610, 666], scores), [244, 306, 366, 424, 484, 550, 610, 666, 726]);
});

test("prefers complete edge rhythm over a plausible bright-icon run", () => {
  const cyanColumns = projection(820, [471, 526, 579, 630, 695, 746]);
  const cyanRows = projection(1000, [454, 509, 571, 633, 694, 755, 814, 874, 931]);
  const edgeColumns = projection(820, [244, 306, 366, 424, 484, 550, 610, 666]);
  edgeColumns[726] = 66;
  const edgeRows = projection(1000, [448, 506, 568, 630, 692, 754, 814, 874, 932]);
  const grid = photoRecognitionTestInternals.gridFromProjections(cyanColumns, cyanRows, edgeColumns, edgeRows);
  assert.deepEqual(grid?.xs, [244, 306, 366, 424, 484, 550, 610, 666, 726]);
  assert.deepEqual(grid?.ys, [448, 506, 568, 630, 692, 754, 814, 874, 932]);
});

test("distinguishes a visible yellow stack amount from an unlabeled one-item slot", () => {
  const width = 40;
  const height = 40;
  const blank = new Uint8ClampedArray(width * height * 4);
  assert.equal(photoRecognitionTestInternals.quantityMarkFromPixels(blank, width, height), false);
  const marked = new Uint8ClampedArray(blank);
  for (let y = 4; y < 11; y += 1) {
    for (let x = 1; x < 5; x += 1) {
      const offset = (y * width + x) * 4;
      marked[offset] = 220;
      marked[offset + 1] = 205;
      marked[offset + 2] = 35;
      marked[offset + 3] = 255;
    }
  }
  assert.equal(photoRecognitionTestInternals.quantityMarkFromPixels(marked, width, height), true);
});

test("routes a plausible low-confidence icon to explicit review instead of dropping it", () => {
  assert.equal(photoRecognitionTestInternals.recognitionCandidateStatus(0.19, 0.021, 0.11, 54), "review");
  assert.equal(photoRecognitionTestInternals.recognitionCandidateStatus(0.16, 0.03, 0.18, 72), "accept");
  assert.equal(photoRecognitionTestInternals.recognitionCandidateStatus(0.24, 0.008, 0.04, 38), "reject");
});

test("reads a yellow two-digit stack without relying on the browser TextDetector", () => {
  const width = 60;
  const height = 58;
  const pixels = new Uint8ClampedArray(width * height * 4);
  const templates = [
    "3f07ff7ff7ff01f01f01f03f07f07f07f0ff3fe7fefffffd7fd7fdffc3c0",
    "1e01f8ffeffeffffffffffffffffffffffffffffffffeffeffcff0bc0180",
  ];
  const bits = (encoded) => [...encoded].flatMap((value) => Number.parseInt(value, 16).toString(2).padStart(4, "0").split(""));
  templates.forEach((encoded, digit) => {
    const mask = bits(encoded);
    for (let y = 0; y < 20; y += 1) {
      for (let x = 0; x < 12; x += 1) {
        if (mask[y * 12 + x] !== "1") continue;
        const targetX = 4 + digit * 11 + x;
        const targetY = 6 + y;
        const offset = (targetY * width + targetX) * 4;
        pixels[offset] = 240;
        pixels[offset + 1] = 215;
        pixels[offset + 2] = 20;
        pixels[offset + 3] = 255;
      }
    }
  });
  assert.equal(photoRecognitionTestInternals.quantityFromPixels(pixels, width, height)?.quantity, 20);
});
