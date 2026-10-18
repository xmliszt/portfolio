const ART = { width: 40, height: 60 };
const TITLE_LINES = [
  { text: "BACK", y: 15, size: 9 },
  { text: "TO THE", y: 24, size: 6 },
  { text: "FUTURE", y: 33, size: 8 },
];

function skewAround(point: { x: number; y: number }) {
  return `translate(${point.x} ${point.y}) skewX(-12) translate(${-point.x} ${-point.y})`;
}

type ToyBoxEndPrintProps = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Draw the box end's comic cover print inside the `x`, `y`, `width`, `height` panel: the title stacked in slanted capitals over a lightning bolt and a "1955" plate. */
export function ToyBoxEndPrint(props: ToyBoxEndPrintProps) {
  const scale = Math.min(props.width / ART.width, props.height / ART.height);
  const offsetX = props.x + (props.width - ART.width * scale) / 2;
  const offsetY = props.y + (props.height - ART.height * scale) / 2;
  return (
    <g transform={`translate(${offsetX} ${offsetY}) scale(${scale})`}>
      <rect
        x={2}
        y={2}
        width={36}
        height={56}
        rx={2}
        className="fill-[var(--lm-shade-1)] stroke-[var(--lm-detail)]"
        strokeWidth={0.8}
      />
      <g
        className="fill-[var(--lm-ink-hi)] stroke-none font-[family-name:var(--lm-font-mono)]"
        fontWeight={700}
        fontStyle="italic"
        textAnchor="middle"
      >
        {TITLE_LINES.map((line) => (
          <text
            key={line.text}
            x={20}
            y={line.y}
            fontSize={line.size}
            transform={skewAround({ x: 20, y: line.y })}
          >
            {line.text}
          </text>
        ))}
      </g>
      <polyline
        points="24,36 16,43 21,44 13,51"
        className="fill-none stroke-[var(--lm-ink)]"
        strokeWidth={1}
      />
      <text
        x={20}
        y={56}
        fontSize={6}
        textAnchor="middle"
        className="fill-[var(--lm-toy-light)] stroke-none font-[family-name:var(--lm-font-mono)]"
      >
        1955
      </text>
    </g>
  );
}
