/** Return the `lm-doodle-wiggle` keyframes, which keep an element visible for the first of every `frameCount` slots and hidden for the rest. */
export function getWiggleKeyframes(frameCount: number) {
  return `@keyframes lm-doodle-wiggle { 0% { opacity: 1; } ${100 / frameCount}% { opacity: 0; } 100% { opacity: 0; } }`;
}
