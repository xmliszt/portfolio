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
@media (prefers-reduced-motion: reduce) {
  [data-lm-motion] { animation: none !important; transition: none !important; }
}
`}</style>
  );
}
