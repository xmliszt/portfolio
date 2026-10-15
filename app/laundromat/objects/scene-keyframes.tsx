import {
  LAMP_FLICKER_MS,
  LAMP_FLICKER_STEPS,
} from "@/lib/laundromat/lamp-flicker-steps";
import type { SceneConfig } from "@/lib/laundromat/scene-config";

const LEAF_FLUTTER_RATIO = 0.5;

const lampFlickerFrames = [
  ...LAMP_FLICKER_STEPS.map(
    ({ atMs, level }) =>
      `  ${((atMs / LAMP_FLICKER_MS) * 100).toFixed(1)}% { opacity: ${level}; }`
  ),
  "  100% { opacity: 1; }",
].join("\n");

type SceneKeyframesProps = {
  plant: SceneConfig["details"]["plant"];
};

export function SceneKeyframes(props: SceneKeyframesProps) {
  const sway = props.plant.swayDeg;
  return (
    <style>{`
@keyframes lm-spin { to { transform: rotate(360deg); } }
@keyframes lm-lamp-flicker {
${lampFlickerFrames}
}
@media (prefers-reduced-motion: no-preference) {
  [data-lm-lamp-switch="on"] .lm-lamp { animation: lm-lamp-flicker ${LAMP_FLICKER_MS}ms steps(1, end); }
  [data-lm-lamp-switch] .lm-lamp > * { transition: none !important; }
}
@keyframes lm-tumble {
  0%, 100% { transform: rotate(0deg); }
  55% { transform: rotate(68deg); }
  68% { transform: rotate(6deg); }
  78% { transform: rotate(16deg); }
}
@keyframes lm-tumble-high {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(96deg); }
  64% { transform: rotate(-4deg); }
  76% { transform: rotate(10deg); }
}
@keyframes lm-slosh {
  from { transform: rotate(-7deg) translateX(-1.5px); }
  to { transform: rotate(7deg) translateX(1.5px); }
}
@keyframes lm-sway { from { transform: rotate(${-sway * LEAF_FLUTTER_RATIO}deg); } to { transform: rotate(${sway * LEAF_FLUTTER_RATIO}deg); } }
@keyframes lm-wiggle {
  0%, 100% { transform: rotate(0deg); }
  12% { transform: rotate(${-sway * 1.6}deg); }
  28% { transform: rotate(${sway * 1.3}deg); }
  44% { transform: rotate(${-sway * 0.9}deg); }
  60% { transform: rotate(${sway * 0.55}deg); }
  78% { transform: rotate(${-sway * 0.25}deg); }
}
@keyframes lm-bend { from { transform: skewX(${-sway}deg); } to { transform: skewX(${sway}deg); } }
@keyframes lm-rise {
  0% { opacity: 0; transform: translateY(0); }
  30% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-14px); }
}
@keyframes lm-stream { to { stroke-dashoffset: -6.8; } }
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
@keyframes lm-weather-fall { from { transform: translate(0, 0); } to { transform: translate(var(--lm-fall-drift), var(--lm-fall-distance)); } }
@keyframes lm-snow-sway { from { transform: translateX(-2.5px); } to { transform: translateX(2.5px); } }
@keyframes lm-ripple { from { opacity: 0.6; transform: scale(0.15); } to { opacity: 0; transform: scale(1); } }
@keyframes lm-splash { 0% { opacity: 0; } 8% { opacity: 0.55; } 30%, 100% { opacity: 0; } }
@keyframes lm-cloud-drift { from { transform: translateX(-4px); } to { transform: translateX(4px); } }
@keyframes lm-lightning {
  0% { opacity: 0; }
  4% { opacity: 0.5; }
  12% { opacity: 0.05; }
  20% { opacity: 0.35; }
  45%, 100% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  [data-lm-motion] { animation: none !important; transition: none !important; }
}
`}</style>
  );
}
