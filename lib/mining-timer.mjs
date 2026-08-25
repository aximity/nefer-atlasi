export function buildRespawnEstimate(observations) {
  const values = observations
    .filter((row) => row?.result === "found")
    .map((row) => Number(row.elapsedMinutes))
    .filter((value) => Number.isFinite(value) && value > 0 && value <= 1440)
    .sort((a, b) => a - b);

  if (values.length < 2) {
    return {
      sampleCount: values.length,
      lowerMinutes: null,
      medianMinutes: values[0] ?? null,
      upperMinutes: null,
      confidence: values.length === 1 ? "Tek gözlem" : "Veri yok",
    };
  }

  const middle = Math.floor(values.length / 2);
  const median = values.length % 2
    ? values[middle]
    : (values[middle - 1] + values[middle]) / 2;

  return {
    sampleCount: values.length,
    lowerMinutes: values[0],
    medianMinutes: median,
    upperMinutes: values[values.length - 1],
    confidence:
      values.length >= 10
        ? "Güçlü örneklem"
        : values.length >= 5
          ? "Gelişen tahmin"
          : "Ön tahmin",
  };
}

export function timerState(nextCheckAt, now) {
  const remainingMs = Number(nextCheckAt) - Number(now);
  if (!Number.isFinite(remainingMs)) return "invalid";
  if (remainingMs <= 0) return "due";
  if (remainingMs <= 60_000) return "soon";
  return "waiting";
}

export function formatTimerDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(Number(milliseconds) / 1000));
  if (!Number.isFinite(totalSeconds)) return "—";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
