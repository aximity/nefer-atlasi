export type MiningTimingObservation = {
  result: "found" | "empty";
  elapsedMinutes: number;
};

export type RespawnEstimate = {
  sampleCount: number;
  lowerMinutes: number | null;
  medianMinutes: number | null;
  upperMinutes: number | null;
  confidence: "Veri yok" | "Tek gözlem" | "Ön tahmin" | "Gelişen tahmin" | "Güçlü örneklem";
};

export function buildRespawnEstimate(observations: MiningTimingObservation[]): RespawnEstimate;
export function timerState(nextCheckAt: number, now: number): "invalid" | "due" | "soon" | "waiting";
export function formatTimerDuration(milliseconds: number): string;
