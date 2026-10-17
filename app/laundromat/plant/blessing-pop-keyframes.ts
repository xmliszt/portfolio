/** CSS keyframes for a blessing label: `lm-blessing-pop` bounces it up and out along `--lm-drift`, `--lm-lift` and `--lm-tilt`; `lm-blessing-fade` fades it in and out. */
export const BLESSING_POP_KEYFRAMES = `
@keyframes lm-blessing-pop {
  0% { transform: translate(0, 40px) scale(0.3) rotate(calc(var(--lm-tilt) * -1)); }
  18% { transform: translate(calc(var(--lm-drift) * 0.6), calc(var(--lm-lift) * -1 - 14px)) scale(1.22) rotate(var(--lm-tilt)); }
  30% { transform: translate(calc(var(--lm-drift) * 0.85), calc(var(--lm-lift) * -1 + 4px)) scale(0.9) rotate(calc(var(--lm-tilt) * -0.5)); }
  40% { transform: translate(var(--lm-drift), calc(var(--lm-lift) * -1 - 2px)) scale(1.05) rotate(calc(var(--lm-tilt) * 0.25)); }
  100% { transform: translate(calc(var(--lm-drift) * 1.3), calc(var(--lm-lift) * -1 - 20px)) scale(1) rotate(calc(var(--lm-tilt) * 0.5)); }
}
@keyframes lm-blessing-fade {
  0% { opacity: 0; }
  8% { opacity: 1; }
  75% { opacity: 1; }
  100% { opacity: 0; }
}
`;
