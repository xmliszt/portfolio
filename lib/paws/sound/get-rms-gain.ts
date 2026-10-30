const TARGET_RMS = 0.12;
const MIN_GAIN = 0.25;
const MAX_GAIN = 4;

/** Return the gain that brings the clip's RMS level across all `channels` to the shared target, clamped to 0.25..4, and 1 for silence. */
export function getRmsGain(channels: Float32Array[]) {
  const sampleCount = channels.reduce((sum, channel) => sum + channel.length, 0);
  const sumOfSquares = channels.reduce(
    (sum, channel) => channel.reduce((channelSum, sample) => channelSum + sample * sample, sum),
    0
  );
  if (sampleCount === 0 || sumOfSquares === 0) return 1;
  const rms = Math.sqrt(sumOfSquares / sampleCount);
  return Math.min(Math.max(TARGET_RMS / rms, MIN_GAIN), MAX_GAIN);
}
