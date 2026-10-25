export function getDecorationPose(options: {
  progress: number;
  reducedMotion: boolean;
}) {
  const progress = Math.max(0, Math.min(1, options.progress));
  if (progress >= 1) return 0;
  if (options.reducedMotion) return 1;
  if (progress < 0.22) return 1 - (1 - progress / 0.22) ** 3;
  if (progress < 0.65) return 1;
  const release = (progress - 0.65) / 0.35;
  return 1 - release * release * (3 - 2 * release);
}
