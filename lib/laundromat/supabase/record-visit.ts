import "server-only";

import { SupabaseClient } from "@supabase/supabase-js";

import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";
import { LaundromatDatabase } from "@/lib/laundromat/supabase/notebook-types";

type RecordVisitOptions = {
  client: SupabaseClient<LaundromatDatabase>;
  visitorId: string;
  locale: LaundromatLocale;
  country: string | undefined;
  referrerHost: string | undefined;
};

/** Count a visit by `visitorId` on today's UTC date through `record_visit`, keeping the first visit's `locale`, `country` and `referrerHost` for the day, and throw on a database error. */
export async function recordVisit(options: RecordVisitOptions) {
  const { error } = await options.client.rpc("record_visit", {
    p_visitor_id: options.visitorId,
    p_locale: options.locale,
    p_country: options.country,
    p_referrer_host: options.referrerHost,
  });

  if (error) {
    throw error;
  }
}
