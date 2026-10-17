/** Draw the "live" mark, a dot inside a ring with four ticks, in a 24-unit box centred on the origin, matching `WeatherGlyph`. */
export function LiveGlyph() {
  return (
    <g strokeLinecap="round">
      <circle r={2.4} className="fill-[var(--lm-accent)] stroke-none" />
      <g className="fill-none stroke-[var(--lm-ink-hi)]" strokeWidth={1.3}>
        <circle r={6} />
        <path d="M 0 -9.5 V -7.5 M 0 7.5 V 9.5 M -9.5 0 H -7.5 M 7.5 0 H 9.5" />
      </g>
    </g>
  );
}
