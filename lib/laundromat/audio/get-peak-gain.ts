const MAX_GAIN = 30;

/** Return the gain that brings the loudest sample across `channels` to full scale, capped at `MAX_GAIN` so near-silent audio is not boosted into noise. */
export function getPeakGain(channels: Float32Array[]) {
  const peak = channels.reduce(
    (loudest, samples) =>
      samples.reduce((max, sample) => Math.max(max, Math.abs(sample)), loudest),
    0
  );
  return peak === 0 ? 1 : Math.min(MAX_GAIN, 1 / peak);
}
