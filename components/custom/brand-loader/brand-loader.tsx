import "./brand-loader.css";

const DRUM_HOLES = Array.from({ length: 12 }, (_, index) => {
  const angle = (index * Math.PI) / 6;
  return {
    cx: Math.round(50 + 30 * Math.sin(angle)),
    cy: Math.round(50 - 30 * Math.cos(angle)),
  };
});

const BUBBLES = [
  { className: "bl-bubble-1", cx: 41, cy: 79, r: 1.3 },
  { className: "bl-bubble-2", cx: 58, cy: 80, r: 0.9 },
  { className: "bl-bubble-3", cx: 50, cy: 81, r: 1.1 },
  { className: "bl-bubble-4", cx: 66, cy: 76, r: 0.7 },
];

type BrandLoaderProps = {
  /** Color set to draw with; follows the site's `.dark` class when unset. */
  tone?: "light" | "dark";
};

/** Render a washer porthole whose drum spins five icons through half-full water, with an sr-only "Loading" label. */
export function BrandLoader(props: BrandLoaderProps) {
  return (
    <div role="status" data-tone={props.tone} className="brand-loader">
      <svg
        viewBox="0 0 100 100"
        aria-hidden
        className="size-[108px] overflow-visible"
      >
        <defs>
          <clipPath id="brand-loader-glass">
            <circle cx="50" cy="50" r="33" />
          </clipPath>
        </defs>
        <circle className="bl-glass" cx="50" cy="50" r="33" />
        <g clipPath="url(#brand-loader-glass)">
          <g className="bl-water">
            <path
              className="bl-wave"
              d="M-10 49 q6.25 -2.6 12.5 0 t12.5 0 t12.5 0 t12.5 0 t12.5 0 t12.5 0 t12.5 0 t12.5 0 t12.5 0 t12.5 0 V120 H-10Z"
            />
          </g>
          <g className="bl-drum">
            <g className="bl-holes">
              {DRUM_HOLES.map((hole) => (
                <circle
                  key={`${hole.cx}-${hole.cy}`}
                  cx={hole.cx}
                  cy={hole.cy}
                  r="1.2"
                />
              ))}
            </g>
            <g className="bl-item-slot" transform="translate(50 31)">
              <g className="bl-item">
                <path
                  className="bl-ink"
                  d="M-5.5 3.5 V-3 L-3.5 -6.5 L-1.4 -3.4 H1.4 L3.5 -6.5 L5.5 -3 V3.5 Q0 6.5 -5.5 3.5Z"
                />
                <circle className="bl-hot" cx="-2" cy="0" r=".9" />
                <circle className="bl-hot" cx="2" cy="0" r=".9" />
              </g>
            </g>
            <g className="bl-item-slot" transform="translate(68 44)">
              <g className="bl-item">
                <path
                  className="bl-hot"
                  d="M0 4.5 C-6.5 0 -5.5 -5.5 -1.8 -4.6 Q0 -4.1 0 -2.3 Q0 -4.1 1.8 -4.6 C5.5 -5.5 6.5 0 0 4.5Z"
                />
              </g>
            </g>
            <g className="bl-item-slot" transform="translate(61 65)">
              <g className="bl-item">
                <path className="bl-ink" d="M-1.5 4 V-5 L4.5 -6.5 V2.5" />
                <circle className="bl-hot" cx="-3.4" cy="4.2" r="2.1" />
                <circle className="bl-hot" cx="2.6" cy="2.7" r="2.1" />
              </g>
            </g>
            <g className="bl-item-slot" transform="translate(39 65)">
              <g className="bl-item">
                <circle className="bl-ink" cx="-1.4" cy="0" r="4.4" />
                <circle className="bl-hot-stroke" cx="1.4" cy="0" r="4.4" />
              </g>
            </g>
            <g className="bl-item-slot" transform="translate(32 44)">
              <g className="bl-item">
                <path
                  className="bl-ink"
                  d="M-2.5 -6.5 V1 Q-2.5 5.5 2 5.5 H3.5 Q6.5 5.5 6.5 3 Q6.5 1 3.8 .8 H2.5 V-6.5Z"
                />
                <path className="bl-hot-stroke" d="M-2.5 -4 H2.5" />
              </g>
            </g>
          </g>
          <g className="bl-water">
            <g className="bl-front">
              <path
                className="bl-wave"
                d="M-10 51.5 q6.25 2.2 12.5 0 t12.5 0 t12.5 0 t12.5 0 t12.5 0 t12.5 0 t12.5 0 t12.5 0 t12.5 0 t12.5 0 V120 H-10Z"
              />
              <path
                className="bl-crest"
                d="M-10 51.5 q6.25 2.2 12.5 0 t12.5 0 t12.5 0 t12.5 0 t12.5 0 t12.5 0 t12.5 0 t12.5 0 t12.5 0 t12.5 0"
              />
            </g>
          </g>
          {BUBBLES.map((bubble) => (
            <g key={bubble.className} className={`bl-rise ${bubble.className}`}>
              <g className="bl-sway">
                <circle
                  className="bl-bubble"
                  cx={bubble.cx}
                  cy={bubble.cy}
                  r={bubble.r}
                />
              </g>
            </g>
          ))}
          <path className="bl-sheen" d="M28 36 A26 26 0 0 1 42 23" />
        </g>
        <circle className="bl-rim" cx="50" cy="50" r="33" />
        <circle className="bl-door" cx="50" cy="50" r="40" />
      </svg>
      <span className="sr-only">Loading</span>
    </div>
  );
}
