import type { MetricField, PlatformId } from "./platforms";

export type StatPost = {
  id: string;
  platform: PlatformId;
  kind: string;
  postedAt: Date | undefined;
  hashtags: string[];
  body: string;
  variant: "mine" | "chatgpt";
  variantGroup: string | undefined;
};

export type MetricCheckpoint = "1h" | "24h" | "7d" | "extra";

export type StatMetric = {
  postId: string;
  checkpoint: MetricCheckpoint;
  capturedAt: Date;
} & { [field in MetricField]?: number };
