import Link from "next/link";

import { Panel } from "@/app/cc/_ui/panel";
import { PlatformChip } from "@/app/cc/_ui/platform-chip";
import type { PlatformId } from "@/lib/cc/platforms";

type VoiceCheckPanelProps = {
  cleanCount: number;
  flagged: {
    postId: string;
    platformId: PlatformId;
    name: string;
    flagCount: number;
    labels: string[];
  }[];
};

export function VoiceCheckPanel(props: VoiceCheckPanelProps) {
  return (
    <Panel
      title="VOICE CHECK · QUEUE"
      className="flex-[1_1_280px]"
      bodyClassName="flex flex-col gap-y-2.5 px-3 py-2.5"
    >
      <div className="flex flex-wrap items-baseline gap-x-2.5">
        <span className="text-cc-ok text-[18px] leading-none font-bold">
          {props.cleanCount}
        </span>
        <span className="text-muted-foreground">clean</span>
        <span className="text-cc-warn ml-3 text-[18px] leading-none font-bold">
          {props.flagged.length}
        </span>
        <span className="text-muted-foreground">flagged</span>
      </div>
      {props.flagged.length === 0 ? (
        <span className="text-muted-foreground">
          No AI-sounding wording found in the queued posts.
        </span>
      ) : (
        <ul className="flex flex-col">
          {props.flagged.map((item) => (
            <li key={item.postId}>
              <Link
                href={`/composer?post=${item.postId}`}
                className="hover:bg-cc-panel-2 flex min-h-7 items-center gap-x-2 border-b border-dashed py-1.5"
              >
                <PlatformChip platformId={item.platformId} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-cc-text-2 truncate">{item.name}</span>
                  <span className="text-muted-foreground truncate text-[11px]">
                    {item.flagCount} · {item.labels.join(" · ")}
                  </span>
                </span>
                <span className="text-primary text-[12px]">Fix →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
