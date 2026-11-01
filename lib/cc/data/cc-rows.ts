import type { Tables } from "@/lib/cc/supabase/__generated__/types";

export type CampaignRow = Tables<{ schema: "command_center" }, "campaigns">;
export type PostRow = Tables<{ schema: "command_center" }, "posts">;
export type PostMetricRow = Tables<
  { schema: "command_center" },
  "post_metrics"
>;
export type ReminderRow = Tables<{ schema: "command_center" }, "reminders">;
export type NoteRow = Tables<{ schema: "command_center" }, "notes">;
