import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

/** Return the attempt, machine and spend time of every tip spent by one of `attempts` into a machine since `since`; throws on a database error. */
export async function listGoldenSpends(options: {
  client: SupabaseClient<LaundromatDatabase>;
  attempts: string[];
  since: Date;
}) {
  const { data, error } = await options.client
    .from("tips")
    .select("spent_attempt, spent_machine_id, spent_at")
    .in("spent_attempt", options.attempts)
    .gte("spent_at", options.since.toISOString());
  if (error) throw error;
  return data.flatMap((row) =>
    row.spent_attempt !== null &&
    row.spent_machine_id !== null &&
    row.spent_at !== null
      ? [
          {
            attempt: row.spent_attempt,
            machineId: row.spent_machine_id,
            spentAt: row.spent_at,
          },
        ]
      : []
  );
}
