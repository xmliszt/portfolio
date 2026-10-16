import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";

const WISPS = [
  { offset: -2.5, delayRatio: 0 },
  { offset: 1.5, delayRatio: 0.45 },
  { offset: 4, delayRatio: 0.75 },
];

type SteamWispsProps = {
  x: number;
  y: number;
  height: number;
  opacity: number;
  riseSeconds: number;
};

export function SteamWisps(props: SteamWispsProps) {
  const { quality } = useRenderQuality();
  const { height } = props;
  if (quality === "lite") return null;
  return (
    <g
      transform={`translate(${props.x} ${props.y})`}
      className="fill-none stroke-[var(--lm-ink-hi)]"
      strokeWidth={0.75}
      strokeLinecap="round"
      opacity={props.opacity}
    >
      {WISPS.map((wisp) => (
        <path
          key={wisp.offset}
          data-lm-motion
          d={`M ${wisp.offset} 0 C ${wisp.offset - 3} ${-height * 0.3} ${wisp.offset + 3} ${-height * 0.6} ${wisp.offset} ${-height}`}
          style={{
            animation: `lm-rise ${props.riseSeconds}s ease-out ${-wisp.delayRatio * props.riseSeconds}s infinite`,
          }}
        />
      ))}
    </g>
  );
}
