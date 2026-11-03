import { PlatformChip } from "@/app/cc/_ui/platform-chip";
import { cn } from "@/lib/utils";

import type { PlanPreviewRow } from "./plan-preview-row";

type PlanPreviewTableProps = {
  rows: readonly PlanPreviewRow[];
};

const MARKERS = {
  moved: { label: "MOVED", className: "text-primary" },
  unchanged: { label: "SAME", className: "text-muted-foreground" },
  pinned: { label: "PINNED", className: "text-muted-foreground" },
  unplaced: { label: "NO SLOT", className: "text-cc-warn" },
} as const satisfies {
  [kind in PlanPreviewRow["kind"]]: { label: string; className: string };
};

export function PlanPreviewTable(props: PlanPreviewTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left">
        <thead className="text-muted-foreground text-[11px] tracking-[0.04em]">
          <tr>
            <th className="py-2 pr-2 font-normal">POST</th>
            <th className="px-2 py-2 font-normal">WAVE</th>
            <th className="px-2 py-2 font-normal">CURRENT → PROPOSED</th>
            <th className="px-2 py-2 font-normal">WHY</th>
            <th className="py-2 pl-2 text-right font-normal">CHANGE</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr key={row.postId} className="border-cc-line-soft border-t">
              <td className="py-2.5 pr-2">
                <span className="flex items-center gap-x-2">
                  <PlatformChip platformId={row.platformId} />
                  <span className="text-cc-text-2 max-w-[260px] truncate">
                    {row.name}
                  </span>
                </span>
              </td>
              <td className="text-muted-foreground px-2 py-2.5 tabular-nums">
                {row.wave ?? "–"}
              </td>
              <td className="px-2 py-2.5 whitespace-nowrap tabular-nums">
                <span className="text-muted-foreground">
                  {row.currentLabel ?? "unscheduled"}
                </span>
                {row.proposedLabel !== undefined && (
                  <>
                    {" → "}
                    <span
                      className={cn(
                        row.kind === "moved" && "text-primary font-bold"
                      )}
                    >
                      {row.proposedLabel}
                    </span>
                  </>
                )}
              </td>
              <td className="text-cc-text-2 px-2 py-2.5 text-[12px]">
                {row.reason}
              </td>
              <td
                className={cn(
                  "py-2.5 pl-2 text-right text-[11px] tracking-[0.04em]",
                  MARKERS[row.kind].className
                )}
              >
                {MARKERS[row.kind].label}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
