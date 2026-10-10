import type { BedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";

type FirstVisitKeyframesProps = {
  motion: BedroomConfig["motion"];
};

export function FirstVisitKeyframes(props: FirstVisitKeyframesProps) {
  const { nudge, walkIn } = props.motion;
  const nudgeFrames = `0% { transform: none; }
  32% { transform: translateY(${-nudge.liftPx}px) rotate(${-nudge.tiltDeg}deg); }
  58% { transform: translateY(${-nudge.liftPx * 0.15}px) rotate(${nudge.tiltDeg * 0.36}deg); }
  78% { transform: translateY(${-nudge.liftPx * 0.3}px) rotate(${-nudge.tiltDeg * 0.14}deg); }
  100% { transform: none; }`;
  const jiggleFrames =
    "25% { transform: rotate(-18deg); } 60% { transform: rotate(8deg); }";
  const bumpFrames = "30% { transform: scale(1.025, 0.965); }";
  const nudgeEase = "cubic-bezier(0.37, 0, 0.63, 1)";
  const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";
  return (
    <style>{`
@keyframes lm-fv-nudge-a { ${nudgeFrames} }
@keyframes lm-fv-nudge-b { ${nudgeFrames} }
@keyframes lm-fv-nudge-glow {
  0%, 100% { stroke: color-mix(in srgb, var(--lm-ink) 60%, transparent); }
  35% { stroke: color-mix(in srgb, var(--lm-accent) 70%, var(--lm-line)); }
}
@keyframes lm-fv-jiggle-a { ${jiggleFrames} }
@keyframes lm-fv-jiggle-b { ${jiggleFrames} }
@keyframes lm-fv-bump-a { ${bumpFrames} }
@keyframes lm-fv-bump-b { ${bumpFrames} }
@keyframes lm-fv-land { from { transform: scale(1.06, 0.9); } }
@keyframes lm-fv-crumple { to { opacity: 0; } }
@keyframes lm-fv-breathe { 50% { opacity: 0.07; } }
@keyframes lm-fv-breathe-line { 50% { opacity: 0.55; } }
@keyframes lm-fv-arrive {
  from { opacity: 0; filter: blur(${walkIn.arriveBlurPx}px); transform: scale(${walkIn.arriveFromScale}); }
}
@keyframes lm-fv-fade-in { from { opacity: 0; } }
[data-lm-nudge] { transform-box: fill-box; transform-origin: 50% 100%; }
[data-lm-nudge="a"] { animation: lm-fv-nudge-a ${nudge.durationMs}ms ${nudgeEase}; }
[data-lm-nudge="b"] { animation: lm-fv-nudge-b ${nudge.durationMs}ms ${nudgeEase}; }
[data-lm-nudge] [data-garment-cloth] { animation: lm-fv-nudge-glow ${nudge.durationMs}ms ${nudgeEase}; }
[data-lm-jiggle="a"] { animation: lm-fv-jiggle-a 320ms ${easeOut}; }
[data-lm-jiggle="b"] { animation: lm-fv-jiggle-b 320ms ${easeOut}; }
[data-lm-bump] { transform-box: fill-box; transform-origin: 50% 100%; }
[data-lm-bump="a"] { animation: lm-fv-bump-a ${props.motion.basketBumpMs}ms ${easeOut}; }
[data-lm-bump="b"] { animation: lm-fv-bump-b ${props.motion.basketBumpMs}ms ${easeOut}; }
[data-lm-land] { transform-box: fill-box; transform-origin: 50% 100%; animation: lm-fv-land ${props.motion.landMs}ms ${easeOut}; }
[data-lm-crumple] { animation: lm-fv-crumple ${props.motion.crumpleMs}ms ${easeOut} forwards; }
[data-lm-breathe="spill"] { animation: lm-fv-breathe 3.2s ease-in-out infinite; }
[data-lm-breathe="line"] { animation: lm-fv-breathe-line 3.2s ease-in-out infinite; }
[data-lm-arrival="arriving"] { will-change: transform, filter, opacity; animation: lm-fv-arrive ${walkIn.arriveMs}ms ${easeOut} backwards; }
@media (prefers-reduced-motion: reduce) {
  [data-lm-nudge="a"], [data-lm-nudge="b"], [data-lm-jiggle], [data-lm-bump], [data-lm-land], [data-lm-breathe] { animation: none; }
  [data-lm-arrival="arriving"] { will-change: opacity; animation: lm-fv-fade-in ${walkIn.reducedFadeMs}ms ease-out backwards; }
}
`}</style>
  );
}
