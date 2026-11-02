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
      title={hasItems ? `Due now · ${props.items.length}` : "Due now"}
      aside={hasItems ? "also sent to Telegram" : undefined}
      className={hasItems ? "border-cc-warn/60" : undefined}
    >
      {hasItems ? (
        <ul>
          {props.items.map((item) => (
            <li
              key={item.key}
              className="border-cc-line-soft flex flex-col gap-y-0.5 border-b px-3 py-1.5"
            >
              <div className="flex items-center justify-between gap-x-2 text-[10.5px]">
                <span className="text-cc-warn font-semibold tracking-[0.04em]">
                  {item.kindLabel}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {item.whenLabel}
                </span>
              </div>
              <div className="flex items-start justify-between gap-x-3">
                <span className="text-cc-text-2 line-clamp-2 text-[11px] leading-4">
                  {item.text}
                </span>
                {item.cta.isExternal ? (
                  <a
                    href={item.cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary shrink-0 text-[11px] whitespace-nowrap hover:underline"
                  >
                    {item.cta.label} ↗
                  </a>
                ) : (
                  <Link
                    href={item.cta.href}
                    className="text-primary shrink-0 text-[11px] whitespace-nowrap hover:underline"
                  >
                    {item.cta.label} →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground px-3 py-3 text-[11px]">
          Nothing due. Reply checks, numbers to log and repost ideas show up
          here after each post goes live.
        </p>
      )}
    </Panel>
  );
}
