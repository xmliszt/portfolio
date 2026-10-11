import { useId } from "react";

const FABRIC_WAVE = [0, -0.08, 0.04, -0.12, -0.02, -0.1, 0.03, -0.06, 0];

type DrumLaundryProps = {
  radius: number;
  running: boolean;
  wet: boolean;
  secondsPerTurn: number;
};

function getHeapPath(options: {
  radius: number;
  topRatio: number;
  flip: boolean;
}) {
  const { radius } = options;
  const wave = options.flip ? FABRIC_WAVE.toReversed() : FABRIC_WAVE;
  const step = (radius * 2.2) / (wave.length - 1);
  const points = wave.map((offset, index) => ({
    x: -radius * 1.1 + index * step,
    y: radius * (options.topRatio + offset),
  }));
  const curve = points
    .slice(1)
    .map((point, index) => {
      const previous = points[index];
      const midX = (previous.x + point.x) / 2;
      return `Q ${previous.x} ${previous.y} ${midX} ${(previous.y + point.y) / 2}`;
    })
    .join(" ");
  const last = points.at(-1) ?? points[0];
  return `M ${points[0].x} ${points[0].y} ${curve} L ${last.x} ${last.y} L ${radius * 1.2} ${radius * 1.2} L ${-radius * 1.2} ${radius * 1.2} Z`;
}

/** Draw the load inside a machine's drum: a fabric heap settled at the bottom that is lifted by the drum and falls back while `running`, under water when `wet` and running. */
export function DrumLaundry(props: DrumLaundryProps) {
  const clipId = useId();
  const { radius } = props;
  const tumbleSeconds = props.secondsPerTurn * 0.8;
  function tumble(delaySeconds: number, name: string) {
    return props.running
      ? {
          animation: `${name} ${tumbleSeconds}s cubic-bezier(0.45, 0, 0.55, 1) ${delaySeconds}s infinite`,
        }
      : undefined;
  }
  const fold = radius * 0.32;
  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <circle r={radius} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`} strokeWidth={0.6}>
        <g data-lm-motion style={tumble(0, "lm-tumble")}>
          <path
            d={getHeapPath({ radius, topRatio: 0.18, flip: false })}
            className="fill-[var(--lm-face-top)] stroke-[var(--lm-line)]"
          />
          <path
            d={`M ${-fold * 1.6} ${radius * 0.42} q ${fold * 0.5} ${-fold * 0.35} ${fold} ${-fold * 0.1} M ${fold * 0.4} ${radius * 0.5} q ${fold * 0.45} ${-fold * 0.3} ${fold * 1.1} 0`}
            className="fill-none stroke-[var(--lm-detail)]"
          />
        </g>
        <g
          data-lm-motion
          style={tumble(-tumbleSeconds * 0.35, "lm-tumble-high")}
        >
          <path
            d={getHeapPath({ radius, topRatio: 0.42, flip: true })}
            className="fill-[var(--lm-detail)] stroke-[var(--lm-line)]"
          />
          <path
            d={`M ${-fold * 0.6} ${radius * 0.62} q ${fold * 0.4} ${-fold * 0.3} ${fold * 0.9} ${-fold * 0.05}`}
            className="fill-none stroke-[var(--lm-face-top)]"
          />
        </g>
        {props.wet && props.running && (
          <path
            data-lm-motion
            d={getHeapPath({ radius, topRatio: 0.3, flip: true })}
            className="fill-[var(--lm-ink-hi)] stroke-none"
            fillOpacity={0.09}
            style={{
              animation: `lm-slosh ${tumbleSeconds}s ease-in-out infinite alternate`,
            }}
          />
        )}
      </g>
    </g>
  );
}
