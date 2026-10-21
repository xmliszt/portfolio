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
    .from("tip_spends")
    .select("attempt, machine_id, spent_at")
    .in("attempt", options.attempts)
    .gte("spent_at", options.since.toISOString());
  if (error) throw error;
  return data.flatMap((row) =>
    row.machine_id !== null
      ? [
          {
            attempt: row.attempt,
            machineId: row.machine_id,
            spentAt: row.spent_at,
          },
        ]
      : []
  );
}
