"use client";

import { useState } from "react";
import { clamp } from "lodash";

import { useRenderQuality } from "./settings/use-render-quality";

const CLAUDE_ORANGE = "#D97757";
const EYE_TRAVEL = { x: 1, y: 1 };
const LEGS_X = [4, 6, 11, 13];

const KEYFRAMES = `
@keyframes lm-claude-wave {
  0%, 100% { transform: rotate(-45deg) scaleX(2.2); }
  25% { transform: rotate(-20deg) scaleX(2.2); }
  75% { transform: rotate(-70deg) scaleX(2.2); }
}
@keyframes lm-claude-hop {
  35% { transform: translateY(-2px) scale(0.94, 1.06); }
  70% { transform: translateY(0) scale(1.08, 0.92); }
}
[data-lm-claude] [data-lm-claude-part] { transform-box: view-box; }
[data-lm-claude-part="hop"] { transform-origin: 9px 10px; }
[data-lm-claude-part="lean"] { transform-origin: 4.5px 10px; transition: transform 280ms cubic-bezier(0.23, 1, 0.32, 1); }
[data-lm-claude-part="arm"] { transform-origin: 15px 5px; transition: transform 200ms cubic-bezier(0.23, 1, 0.32, 1); }
[data-lm-claude-part="eyes"] { transition: transform 120ms ease-out; }
.group:is(:hover, :focus-visible) [data-lm-claude] [data-lm-claude-part="arm"] { transform: rotate(-45deg) scaleX(2.2); }
.group:is(:hover, :focus-visible) [data-lm-claude="full"] [data-lm-claude-part="lean"] { transform: rotate(-14deg); }
.group:is(:hover, :focus-visible) [data-lm-claude="full"] [data-lm-claude-part="arm"] { animation: lm-claude-wave 340ms ease-in-out 150ms infinite; }
[data-lm-claude="full"]:hover [data-lm-claude-part="hop"] { animation: lm-claude-hop 420ms cubic-bezier(0.23, 1, 0.32, 1); }
@media (prefers-reduced-motion: reduce) {
  [data-lm-claude] [data-lm-claude-part] { animation: none !important; transition: none !important; }
}
`;

/** Render the Claude Code mascot inline with text: it leans on one foot and waves while its `group` link is hovered or focused, and hops and follows the cursor with its eyes while hovered itself. */
export function ClaudeAvatar() {
  const { quality } = useRenderQuality();
  const [gaze, setGaze] = useState({ x: 0, y: 0 });

  function handlePointerMove(event: React.PointerEvent<HTMLSpanElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const halfWidth = rect.width / 2;
    const halfHeight = rect.height / 2;
    setGaze({
      x: clamp((event.clientX - rect.left - halfWidth) / halfWidth, -1, 1),
      y: clamp((event.clientY - rect.top - halfHeight) / halfHeight, -1, 1),
    });
  }

  function handlePointerLeave() {
    setGaze({ x: 0, y: 0 });
  }

  return (
    <span
      data-lm-claude={quality}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="-my-1.5 inline-block px-0.5 py-1.5 align-middle"
    >
      <style>{KEYFRAMES}</style>
      <svg
        aria-hidden
        viewBox="0 0 18 10"
        className="block h-2.5 w-[18px] -translate-y-px overflow-visible"
        shapeRendering="crispEdges"
      >
        <g data-lm-claude-part="hop">
          <g data-lm-claude-part="lean">
            <g fill={CLAUDE_ORANGE}>
              <rect x={3} y={0} width={12} height={8} />
              <rect x={1} y={4} width={2} height={2} />
              {LEGS_X.map((x) => (
                <rect key={x} x={x} y={8} width={1} height={2} />
              ))}
              <rect
                data-lm-claude-part="arm"
                x={15}
                y={4}
                width={2}
                height={2}
              />
            </g>
            <g
              data-lm-claude-part="eyes"
              fill="#000"
              style={{
                transform: `translate(${gaze.x * EYE_TRAVEL.x}px, ${gaze.y * EYE_TRAVEL.y}px)`,
              }}
            >
              <rect x={5} y={2} width={1} height={2} />
              <rect x={12} y={2} width={1} height={2} />
            </g>
          </g>
        </g>
      </svg>
      <span className="sr-only">Claude</span>
    </span>
  );
}
