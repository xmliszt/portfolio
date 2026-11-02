import Link from "next/link";

import { Panel } from "@/app/cc/_ui/panel";

import { type RunSheetItem, RunSheetRow } from "./run-sheet-row";

type RunSheetPanelProps = {
  dayLabel: string | undefined;
  items: RunSheetItem[];
};

export function RunSheetPanel(props: RunSheetPanelProps) {
  return (
    <Panel
      title={
        props.dayLabel === undefined
          ? "RUN SHEET"
          : `RUN SHEET · ${props.dayLabel.toUpperCase()}`
      }
      aside="ALL TIMES SGT"
    >
      {props.items.length === 0 ? (
        <p className="text-muted-foreground px-3 py-3 text-[11px]">
          Nothing scheduled. Add a post in the{" "}
          <Link href="/calendar" className="text-primary">
            calendar
          </Link>
          .
        </p>
      ) : (
        <ol>
          {props.items.map((item) => (
            <RunSheetRow key={item.id} item={item} />
          ))}
        </ol>
      )}
    </Panel>
  );
}
