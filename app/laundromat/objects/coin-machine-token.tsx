import type { CoinMachinePhase } from "@/lib/laundromat/tip/tip-token";

const TOKEN_RADIUS_PX = 2.8;

type CoinMachineTokenProps = {
  phase: CoinMachinePhase;
  tray: { x: number; y: number; width: number; height: number };
};

/** Draw the dispensed token resting in `tray` once `phase` is `dispensing` or `token-in-tray`; draw nothing otherwise. */
export function CoinMachineToken(props: CoinMachineTokenProps) {
  const { phase, tray } = props;
  switch (phase.kind) {
    case "idle":
    case "inserting":
      return null;
    case "dispensing":
    case "token-in-tray":
      return (
        <g
          transform={`translate(${tray.x + tray.width / 2} ${tray.y + tray.height * 0.4})`}
        >
          <circle
            r={TOKEN_RADIUS_PX}
            className="fill-[var(--lm-accent)] stroke-[var(--lm-ink)]"
            strokeWidth={0.5}
          />
          <circle
            r={TOKEN_RADIUS_PX * 0.55}
            className="fill-none stroke-[var(--lm-ink)]"
            strokeWidth={0.3}
            opacity={0.6}
          />
        </g>
      );
    default: {
      const unhandled: never = phase;
      return unhandled;
    }
  }
}
