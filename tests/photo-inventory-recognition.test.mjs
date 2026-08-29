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
