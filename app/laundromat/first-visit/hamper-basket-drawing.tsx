import type { GarmentKind } from "@/lib/laundromat/first-visit/bedroom-config";
import type { getHamperBasket } from "@/lib/laundromat/first-visit/get-hamper-basket";
import { PILE_SLOTS } from "@/lib/laundromat/first-visit/get-toss-flight";
import { cn } from "@/lib/utils";

import { CrumpledBall } from "./crumpled-ball";

const WEAVE_ROWS = [0.12, 0.29, 0.46, 0.63, 0.8];
const STAKES = 11;

type HamperBasketDrawingProps = {
  basket: ReturnType<typeof getHamperBasket>;
  pile: { kind: GarmentKind; slotIndex: number }[];
  bumps: number;
  highlighted: boolean;
  accepting: boolean;
  glowFilter: string;
  children: React.ReactNode;
};

export function HamperBasketDrawing(props: HamperBasketDrawingProps) {
  const { basket } = props;
  const { top, base, inner, mouth } = basket;
  function rimAt(ratio: number) {
    return {
      cx: base.cx + (top.cx - base.cx) * ratio,
      cy: base.cy + (top.cy - base.cy) * ratio,
      rx: base.rx + (top.rx - base.rx) * ratio,
      ry: base.ry + (top.ry - base.ry) * ratio,
    };
  }
  return (
    <g
      data-hamper-basket
      data-lm-bump={
        props.bumps === 0 ? undefined : props.bumps % 2 === 0 ? "a" : "b"
      }
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <ellipse {...top} className="fill-[var(--lm-recess)] stroke-none" />
      <path
        className="fill-[var(--lm-face)] stroke-[var(--lm-line)]"
        d={`M ${top.cx - top.rx} ${top.cy} A ${top.rx} ${top.ry} 0 0 1 ${top.cx + top.rx} ${top.cy} L ${inner.cx + inner.rx} ${inner.cy} A ${inner.rx} ${inner.ry} 0 0 0 ${inner.cx - inner.rx} ${inner.cy} Z`}
      />
      {props.pile.map((item) => {
        const slot =
          PILE_SLOTS[Math.min(item.slotIndex, PILE_SLOTS.length - 1)];
        return (
          <g
            key={item.kind}
            transform={`translate(${mouth.x + slot.x} ${mouth.y + slot.y}) rotate(${slot.rotateDeg})`}
          >
            <g data-lm-land>
              <CrumpledBall />
            </g>
          </g>
        );
      })}
      {props.children}
      <path
        className={cn(
          "fill-[var(--lm-face)] transition-[stroke] duration-200",
          props.highlighted
            ? "stroke-[var(--lm-ink-hi)]"
            : "stroke-[var(--lm-ink)]/60"
        )}
        d={basket.body}
      />
      <g className="fill-none stroke-[var(--lm-detail)]">
        {WEAVE_ROWS.map((ratio) => {
          const row = rimAt(ratio);
          return (
            <path
              key={ratio}
              d={`M ${row.cx - row.rx} ${row.cy} A ${row.rx} ${row.ry} 0 0 0 ${row.cx + row.rx} ${row.cy}`}
            />
          );
        })}
        {Array.from({ length: STAKES }, (_, index) => {
          const angle = Math.PI * ((index + 1) / (STAKES + 1));
          return (
            <line
              key={index}
              x1={top.cx - Math.cos(angle) * top.rx}
              y1={top.cy + Math.sin(angle) * top.ry}
              x2={base.cx - Math.cos(angle) * base.rx}
              y2={base.cy + Math.sin(angle) * base.ry}
            />
          );
        })}
      </g>
      <ellipse
        {...top}
        rx={top.rx + 3}
        ry={top.ry + 2}
        className="fill-none stroke-[var(--lm-accent)] transition-opacity duration-200"
        strokeWidth={2}
        filter={props.glowFilter}
        opacity={props.accepting ? 0.9 : 0}
      />
      <ellipse
        {...top}
        className={cn(
          "fill-none transition-[stroke] duration-200",
          props.highlighted
            ? "stroke-[var(--lm-ink-hi)]"
            : "stroke-[var(--lm-ink)]"
        )}
        strokeWidth={2.2}
      />
      <ellipse
        {...top}
        cy={top.cy + 2.5}
        className="fill-none stroke-[var(--lm-detail)]"
      />
      {[-1, 1].map((side) => (
        <ellipse
          key={side}
          cx={top.cx + side * top.rx * 0.8}
          cy={top.cy + 11}
          rx={6}
          ry={2.6}
          transform={`rotate(${side * 18} ${top.cx + side * top.rx * 0.8} ${top.cy + 11})`}
          className="fill-[var(--lm-bg)] stroke-[var(--lm-line)]"
          strokeWidth={0.8}
        />
      ))}
    </g>
  );
}
