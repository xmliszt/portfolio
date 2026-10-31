"use client";

import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { SquircleAppIcon } from "@/components/ui/squircle-app-icon";
import { getSiblingApps } from "@/lib/apps/get-sibling-apps";
import { cn } from "@/lib/utils";

import { RoomSheet } from "./room-sheet";

type OtherAppsSheetProps = {
  onClose: () => void;
};

/** Render the maker's other apps in a sheet over the room as home-screen icons, each opening in a new tab. */
export function OtherAppsSheet(props: OtherAppsSheetProps) {
  const { copy } = usePawsCopy();
  return (
    <RoomSheet title={copy.otherApps.title} onClose={props.onClose}>
      <div className="flex flex-col gap-y-5 px-1">
        <p className="m-0 text-[13px] leading-relaxed">{copy.otherApps.hint}</p>
        <ul className="m-0 grid list-none grid-cols-4 gap-x-2 gap-y-4 p-0">
          {getSiblingApps("paws").map((app) => (
            <li key={app.id}>
              <a
                href={app.href}
                target="_blank"
                rel="noopener"
                className={cn(
                  FOCUS_RING_CLASS,
                  "group flex flex-col items-center gap-y-2 py-1 text-[11px] leading-4 text-[var(--pw-ink)]"
                )}
              >
                <SquircleAppIcon
                  src={app.iconSrc}
                  sizePx={56}
                  className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:-rotate-3 group-active:scale-95 motion-reduce:transition-none"
                />
                <span className="max-w-full truncate decoration-[var(--pw-pink)] decoration-2 underline-offset-4 group-hover:underline">
                  {app.name}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </RoomSheet>
  );
}
