import { getYarnColors } from "@/lib/paws/render/get-yarn-colors";

type ToyBasketIconProps = { className?: string };

const WICKER = { body: "#c9a06a", weave: "#9c7448", rim: "#b0854f" };
const PAPER = { face: "#ebe6da", edge: "#cdc8bc", core: "#a8743f" };

/** Draw a woven basket with a toilet roll and two yarn balls sticking out of it. */
export function ToyBasketIcon(props: ToyBasketIconProps) {
  const pink = getYarnColors("yarn-1");
  const blue = getYarnColors("yarn-2");
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={props.className}>
      <rect
        x="5.2"
        y="3.2"
        width="5.6"
        height="9"
        rx="1"
        fill={PAPER.face}
        stroke={PAPER.edge}
        strokeWidth="0.6"
      />
      <ellipse cx="8" cy="3.4" rx="2.8" ry="1" fill={PAPER.edge} />
      <ellipse cx="8" cy="3.4" rx="1" ry="0.4" fill={PAPER.core} />
      <circle cx="15.6" cy="8.6" r="3.9" fill={pink.body} />
      <g
        fill="none"
        stroke={pink.strand}
        strokeWidth="0.6"
        strokeLinecap="round"
      >
        <path d="M12.4 7.4c2-1.2 4.6-1.2 6.4.2" />
        <path d="M12.2 9.4c2.2-1.4 5-1.2 7 .4" />
        <path d="M14 5.4c.6 2 .6 4.6-.4 6.6" />
      </g>
      <circle cx="11.4" cy="10.6" r="2.6" fill={blue.body} />
      <g
        fill="none"
        stroke={blue.strand}
        strokeWidth="0.5"
        strokeLinecap="round"
      >
        <path d="M9.2 10c1.4-.9 3.2-.9 4.4.1" />
        <path d="M10.4 8.4c.5 1.4.5 3.2-.2 4.4" />
      </g>
      <path d="M2.6 11.6h18.8l-2 9.2H4.6z" fill={WICKER.body} />
      <g fill="none" stroke={WICKER.weave} strokeWidth="0.7">
        <path d="M3.4 14.6h17.2M4 17.6h16" />
        <path d="M7 11.8l-.6 9M10.4 11.8l-.2 9M13.6 11.8l.2 9M17 11.8l.6 9" />
      </g>
      <rect x="2" y="10.8" width="20" height="1.8" rx="0.9" fill={WICKER.rim} />
    </svg>
  );
}
