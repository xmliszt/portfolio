import type { MetricField, PlatformId } from "@/lib/cc/platforms";
import type { MetricCheckpoint } from "@/lib/cc/stats-types";

export type LogEntryPost = {
  postId: string;
  platformId: PlatformId;
  label: string;
  target: string | undefined;
  url: string | undefined;
  lastValues: { [field in MetricField]?: number | undefined };
};

export type LogEntryRowData = LogEntryPost & {
  key: string;
  checkpoint: MetricCheckpoint;
  dueNote: string | undefined;
};
