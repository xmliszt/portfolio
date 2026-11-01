import Link from "next/link";

import { Panel } from "@/app/cc/_ui/panel";

import type { DueItem } from "./build-due-items";

type DueNowPanelProps = {
  items: DueItem[];
};

export function DueNowPanel(props: DueNowPanelProps) {
  const hasItems = props.items.length > 0;
  return (
    <Panel
      title="DUE NOW"
      aside={hasItems ? "ALSO SENT TO TELEGRAM" : undefined}
      className={
        hasItems
          ? "border-cc-warn flex-[2_1_340px] shadow-[0_0_28px_hsl(var(--cc-warn)/0.1)]"
          : "flex-[2_1_340px]"
      }
    >
      {hasItems ? (
        <ul>
          {props.items.map((item) => (
            <li
              key={item.key}
              className="flex flex-col gap-y-2 border-b px-[18px] py-3.5"
            >
              <div className="flex justify-between gap-x-2 text-[11px]">
                <span className="text-cc-warn tracking-[0.12em]">
                  {item.kindLabel}
                </span>
                <span className="text-muted-foreground">{item.whenLabel}</span>
              </div>
              <span className="leading-normal">{item.text}</span>
              {item.cta.isExternal ? (
                <a
                  href={item.cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary flex min-h-11 items-center text-[12px] tracking-[0.08em]"
                >
                  {item.cta.label} ↗
                </a>
              ) : (
                <Link
                  href={item.cta.href}
                  className="text-primary flex min-h-11 items-center text-[12px] tracking-[0.08em]"
                >
                  {item.cta.label} →
                </Link>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground px-[18px] py-6 leading-normal">
          Nothing due. Reply checks, numbers to log and repost ideas show up
          here after each post goes live.
        </p>
      )}
    </Panel>
  );
}
