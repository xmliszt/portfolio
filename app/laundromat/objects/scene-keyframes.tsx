import type { SceneConfig } from "@/lib/laundromat/scene-config";

type SceneKeyframesProps = {
  plant: SceneConfig["details"]["plant"];
};

export function SceneKeyframes(props: SceneKeyframesProps) {
  const sway = props.plant.swayDeg;
  return (
    <style>{`
@keyframes lm-spin { to { transform: rotate(360deg); } }
@keyframes lm-sway { from { transform: rotate(${-sway}deg); } to { transform: rotate(${sway}deg); } }
@keyframes lm-rise {
  0% { opacity: 0; transform: translateY(0); }
  30% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-14px); }
}
@keyframes lm-drip {
  0% { opacity: 0; transform: translateY(0); }
  20% { opacity: 1; }
  90% { opacity: 1; transform: translateY(12px); }
  100% { opacity: 0; transform: translateY(12px); }
}
@keyframes lm-fade-out { 0%, 70% { opacity: 1; } 100% { opacity: 0; } }
@keyframes lm-pulse { 50% { opacity: 0.35; } }
@keyframes lm-scan-drift { to { transform: translateY(var(--lm-scan-step)); } }
@keyframes lm-flicker {
  0%, 100% { opacity: 0.3; }
  8% { opacity: 1; }
  10% { opacity: 0.2; }
  47% { opacity: 0.6; }
  50% { opacity: 0; }
}
@keyframes lm-static { from { opacity: 0.9; transform: translateY(-6px); } to { opacity: 0; transform: translateY(0); } }
@keyframes lm-power-flash { from { opacity: 0.95; } to { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  [data-lm-motion] { animation: none !important; transition: none !important; }
}
`}</style>
  );
}
